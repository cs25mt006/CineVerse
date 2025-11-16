import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService, MovieInfo } from '../../../core/services/movie.service';
import { Navbar } from '../../shared/navbar/navbar';
import { LocationStateService, SelectedLocation } from '../../../core/services/location-state.service';
import { ShowsByLocationService, ShowMovie } from '../../../core/services/shows-by-location.service';
import { Subscription } from 'rxjs';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './movie-details.html',
  styleUrls: ['./movie-details.css']
})

export class MovieDetails implements OnInit {
  movie: MovieInfo | null = null;
  isLoading = true;
  canBook = false;
  currentLocation: SelectedLocation | null = null;
  private subs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private locationState: LocationStateService,
    private showService: ShowsByLocationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    // Load movie first
    this.fetchMovieDetails(id);


    // Subscribe to location changes reactively
    this.subs.add(
      this.locationState.selectedLocation.subscribe((loc) => {
        this.currentLocation = loc;
        if (loc && this.movie) {
          // check availability again whenever location changes
          this.checkAvailability(this.movie.id, loc.id);
        } else {
          this.canBook = false;
        }
      })
    );


    // Handle already selected location on load
    const existing = this.locationState.getLocation();
    if (existing && this.movie) {
      this.checkAvailability(this.movie.id, existing.id);
    }

  }

  fetchMovieDetails(movieId: number): void {
    this.isLoading = true;
    this.movieService.getMovieDetails(movieId).subscribe({
      next: (data) => {
        this.movie = data;
        this.isLoading = false;

        const loc = this.locationState.getLocation();
        if (loc) this.checkAvailability(data.id, loc.id);
      },
      error: (err) => {
        console.error('Error fetching movie details', err);
        this.isLoading = false;
      }
    });
 }


 // Check if this movie is in currently showing list
  checkAvailability(movieId: number, locationId: number): void {
    this.showService.getShowsByLocation(locationId).subscribe({
      next: (movies: ShowMovie[]) => {
        this.canBook = movies.some((m) => m.movie_id === movieId);
      },
      error: (err) => {
        console.error('Error checking movie availability', err);
        this.canBook = false;
      }
    });
  }


  bookTicket(): void {
    if (this.movie && this.canBook) {
      this.router.navigate(['/shows', this.movie.id]);
    }
  }
}
