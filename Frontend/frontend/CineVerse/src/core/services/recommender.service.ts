// src/app/core/services/recommender.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface CompactMovie {
  id: number;
  title: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  score_rank?: number; // precomputed ranking (optional)
  imdb_link?: string;
  poster_path?: string;
  overview?: string;
  genres?: string[]; // recommended to exist in your compact index
}

@Injectable({ providedIn: 'root' })
export class RecommenderService {
  private prefix = '/assets/compact_index/';
  private cache = new Map<string, CompactMovie[]>();

  // algorithm weights (tuneable)
  private ALPHA = 0.75; // similarity weight
  private BETA = 0.25;  // popularity/rank weight

  constructor(private http: HttpClient) {}

  // ---- core helpers ----

  private async fetchFile(fileName: string): Promise<CompactMovie[]> {
    if (this.cache.has(fileName)) return this.cache.get(fileName)!;
    const url = `${this.prefix}${fileName}`;
    const arr = await firstValueFrom(this.http.get<CompactMovie[]>(url));
    // normalize score_rank if present
    const maxRank = Math.max(...arr.map(a => (a.score_rank ?? 0)));
    const norm = maxRank > 0 ? maxRank : 1;
    arr.forEach(a => a.score_rank = (a.score_rank ?? 0) / norm);
    this.cache.set(fileName, arr);
    return arr;
  }

  // fetch a genre file (safe name)
  async fetchGenreFile(genre: string, limit = 2000): Promise<CompactMovie[]> {
    const safe = genre.replace(/[\s-]+/g, '_');

    const fname = `genre_${safe}.json`;
    try {
      const list = await this.fetchFile(fname);
      return list.slice(0, limit);
    } catch (err) {
      console.warn('[Recommender] missing genre file', fname);
      return [];
    }
  }

  async fetchGlobalTop(limit = 5000): Promise<CompactMovie[]> {
    const arr = await this.fetchFile('global_top_5000.json');
    return arr.slice(0, limit);
  }

  // merge lists and dedupe by id
  private mergeDedupe(lists: CompactMovie[][]): CompactMovie[] {
    const map = new Map<number, CompactMovie>();
    for (const list of lists) {
      for (const m of list) {
        if (!map.has(m.id)) map.set(m.id, m);
      }
    }
    return Array.from(map.values());
  }

  // build genre vocabulary from candidates
  private buildGenreIndex(candidates: CompactMovie[]): string[] {
    const set = new Set<string>();
    for (const m of candidates) {
      if (m.genres && m.genres.length) {
        for (const g of m.genres) set.add(g);
      }
    }
    return Array.from(set);
  }

  // build vector [genreOneHot..., popScaled, voteScaled]
  private buildMovieVector(m: CompactMovie, genreIndex: string[]): number[] {
    const vec = new Array(genreIndex.length).fill(0);
    if (m.genres && m.genres.length) {
      for (const g of m.genres) {
        const idx = genreIndex.indexOf(g);
        if (idx >= 0) vec[idx] = 1;
      }
    }
    // popularity & vote normalization: best-effort scaling
    const pop = (m.popularity ?? 0) / 100; // rough; fine if preprocessed
    const vote = (m.vote_average ?? 0) / 10; // scale 0..1
    vec.push(pop);
    vec.push(vote);
    return vec;
  }

  private norm(v: number[]): number {
    let s = 0;
    for (const x of v) s += x * x;
    return Math.sqrt(s) || 1;
  }

  private cosine(a: number[], b: number[]): number {
    let dot = 0;
    for (let i = 0; i < a.length; i++) dot += (a[i] ?? 0) * (b[i] ?? 0);
    return dot / (this.norm(a) * this.norm(b));
  }

  // ---- public API ----
  async getRecommendations(options: {
    watchedIds?: number[];
    preferredGenres?: string[];
    candidateLimit?: number;
    resultCount?: number;
  } = {}): Promise<CompactMovie[]> {
    const watchedSet = new Set((options.watchedIds || []).map(x => Number(x)));
    const preferred = options.preferredGenres || [];
    const candLimit = options.candidateLimit ?? 2000;
    const resultCount = options.resultCount ?? 30;

    // 1) Load candidates
    let candidates: CompactMovie[] = [];
    if (preferred.length > 0) {
      const promises = preferred.map(g => this.fetchGenreFile(g, candLimit));
      const lists = await Promise.all(promises);
      candidates = this.mergeDedupe(lists);
    } else {
      candidates = await this.fetchGlobalTop(candLimit);
    }

    if (!candidates.length) return [];

    // 2) build genre index (vector dims)
    const genreIndex = this.buildGenreIndex(candidates);

    // 3) build candidate vectors map
    const vecMap = new Map<number, number[]>();
    for (const m of candidates) vecMap.set(m.id, this.buildMovieVector(m, genreIndex));

    // 4) build user vector from watched movies (best-effort using candidate vectors)
    const watchedVectors: number[][] = [];
    for (const id of watchedSet) {
      const v = vecMap.get(id);
      if (v) watchedVectors.push(v);
    }

    // initialize user vector
    const userVec = new Array((genreIndex.length) + 2).fill(0);

    if (watchedVectors.length > 0) {
      for (const w of watchedVectors) for (let i = 0; i < w.length; i++) userVec[i] += (w[i] ?? 0);
      for (let i = 0; i < userVec.length; i++) userVec[i] /= watchedVectors.length;
    }

    // apply explicit preferences by boosting corresponding genre dims
    if (preferred.length > 0) {
      for (const g of preferred) {
        const idx = genreIndex.indexOf(g);
        if (idx >= 0) userVec[idx] = (userVec[idx] ?? 0) + 1.2;
      }
    }

    // 5) score candidates
    const scored: { m: CompactMovie; score: number }[] = [];
    for (const m of candidates) {
      if (watchedSet.has(m.id)) continue; // skip watched
      const v = vecMap.get(m.id) || this.buildMovieVector(m, genreIndex);
      const sim = this.cosine(userVec, v); // -1..1
      const sim01 = (sim + 1) / 2; // map to 0..1
      const rank = m.score_rank ?? 0;
      const final = this.ALPHA * sim01 + this.BETA * rank;
      scored.push({ m, score: final });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, resultCount).map(s => s.m);
  }
}
