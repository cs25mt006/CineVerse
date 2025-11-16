import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { MovieService } from '../../../core/services/movie.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './booking-confirmation.html',
  styleUrls: ['./booking-confirmation.css']
})
export class BookingConfirmation implements OnInit {
  movieTitle = '';
  movieLanguage = '';
  theaterName = '';
  date = '';
  showTime = '';
  seats: any[] = [];
  bookingId = '';
  amount = 0;
  movieId = 0;
  posterUrl: string | null = null;


  constructor(
    private router: Router,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    const state = history.state;

    this.movieId = state.movieId;
    this.movieTitle = state.movieTitle || 'Unknown Movie';
    this.movieLanguage = state.movieLanguage || '';
    this.theaterName = state.theaterName || '';
    this.date = state.date || '';
    this.showTime = state.showTime || '';
    this.seats = state.seats || [];
    this.bookingId = state.bookingId || '************';
    this.amount = state.amount/100 || 0;
    if (this.movieId) {
      this.fetchMoviePoster(this.movieId);
    }
    console.log('✅ History state data:', history.state);

  }
  fetchMoviePoster(movieId: number) {
    this.movieService.getMovieDetails(movieId).subscribe({
      next: (movie) => {
        console.log('✅ Movie API response:', movie);
        this.posterUrl = movie.poster || null;
      },
      error: (err) => {
        console.error('Error fetching movie details:', err);
      }
    });
  }

  

  formatSeats(): string {
    return this.seats.map((s: any) => `${String.fromCharCode(65 + s.rownumber - 1)}${s.colomnnumber}`).join(', ');
  }

  backToHome() {
    this.router.navigate(['/']);
  }
}
