import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Movie {
  id: number;
  title: string;
  genre: string;
  language: string;
}

export interface MovieInfo {
  id: number;
  title: string;
  description: string;
  genre: string;
  language: string;
  duration: string;
  releasedate: string;
  cast: string;
  poster: string;
}



@Injectable({ providedIn: 'root' })
export class MovieService {
  private baseUrl = `${environment.apiBaseUrl}/movies`;

  constructor(private http: HttpClient) {}

  searchMovies(query: string): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.baseUrl}/search/?q=${query}`);
  }

  getMovieDetails(movieId: number): Observable<MovieInfo> {
    const url = `${environment.apiBaseUrl}/movies/details/?movie_id=${movieId}`;
    return this.http.get<MovieInfo>(url).pipe(
      map((movie: MovieInfo) => ({
        ...movie,
        poster: this.buildMediaUrl(movie.poster)
      }))
    );
  }

  // Build absolute URL for media (poster) without forcing the '/api' segment.
  // Some backends serve media under the root host (e.g. http://0.0.0.0:8000/media/...),
  // while API endpoints live under /api. This helper strips a trailing '/api' from
  // apiBaseUrl when constructing media URLs.
  private buildMediaUrl(path: string): string {
    if (!path) return path;
    if (path.startsWith('http')) return path;

    // remove trailing /api or /api/ from apiBaseUrl
    const base = environment.apiBaseUrl.replace(/\/api\/?$/, '');
    if (path.startsWith('/')) return `${base}${path}`;
    return `${base}/${path}`;
  }

}
