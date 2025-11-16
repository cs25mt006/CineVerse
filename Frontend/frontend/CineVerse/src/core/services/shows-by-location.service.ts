import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';




export interface ShowMovie {
  movie_id: number;
  title: string;
  poster: string;
}



@Injectable({
  providedIn: 'root'
})
export class ShowsByLocationService {
  private readonly apiUrl = `${environment.apiBaseUrl}/shows/movies-by-location`;
  private readonly MEDIA_BASE_URL = environment.apiBaseUrl.replace(/\/api\/?$/, '') + '/media/posters/';
  constructor(
    private http: HttpClient
  ) {}

  getShowsByLocation(locationId: number): Observable<ShowMovie[]> {
    const url = `${this.apiUrl}/?location_id=${locationId}`;
    return this.http.get<ShowMovie[]>(url).pipe(
      map(movies => movies.map(movie => ({
        ...movie,
        poster: this.buildMediaUrl(movie.poster)
      })))
    );
  }

  getShowsByMovie(movieId: number, locationId: number, date?: string): Observable<any[]> {
    let url = `${environment.apiBaseUrl}/shows/shows-by-movie/?movie_id=${movieId}&location_id=${locationId}`;
    if (date) {
      // Ensure date is in YYYY-MM-DD format
      const formattedDate = new Date(date).toISOString().split('T')[0];
      url += `&date=${encodeURIComponent(formattedDate)}`;
    }
    console.log('Fetching shows with URL:', url); // Debug log
    console.log(this.http.get<any[]>(url));
    return this.http.get<any[]>(url);
  }

  // Build absolute URL for media (poster) without forcing the '/api' segment.
  // private buildMediaUrl(path: string): string {
  //   if (!path) return path;
  //   if (path.startsWith('http')) return path;

  //   const base = environment.apiBaseUrl.replace(/\/api\/?$/, '');
  //   if (path.startsWith('/')) return `${base}${path}`;
  //   return `${base}/${path}`;
  // }
  private buildMediaUrl(path: string): string {
    if (!path || typeof path !== 'string') {
      return 'assets/no-poster.png'; // optional fallback
    }

    const fileName = path.split('/').pop() || '';
    return this.MEDIA_BASE_URL + fileName;
  }

}