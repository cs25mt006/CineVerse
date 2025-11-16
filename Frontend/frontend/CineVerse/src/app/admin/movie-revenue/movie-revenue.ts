import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AdminNavBar } from '../../shared/admin-nav-bar/admin-nav-bar';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-movie-revenue',
  standalone: true,
  imports: [CommonModule, AdminNavBar, Footer],
  templateUrl: './movie-revenue.html',
  styleUrls: ['./movie-revenue.css']
})
export class MovieRevenue implements OnInit {
  movies: any[] = [];
  expandedMovieId: number | null = null;
  isLoading = true;
  private MEDIA_BASE_URL = environment.apiBaseUrl.replace(/\/api\/?$/, '') + '/media/posters/';


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies() {
  this.http
    .get<any[]>(`${environment.apiBaseUrl}/movies/movies/`)
    .subscribe({
      next: (movies) => {
        this.movies = movies.map((movie) => {
          const updatedPoster = this.buildMediaUrl(movie.poster);

          console.log("Before:", movie.poster);
          console.log("After:", updatedPoster);

          return {
            ...movie,
            poster: updatedPoster
          };
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Movie fetch failed:', err);
        this.isLoading = false;
      }
    });
}


  buildMediaUrl(path: string): string {
    if (!path) return '';
    const fileName = path.split('/').pop() || '';
    return this.MEDIA_BASE_URL + fileName;
  }

  

  toggleExpand(movieId: number) {
    this.expandedMovieId = this.expandedMovieId === movieId ? null : movieId;
  }
}
