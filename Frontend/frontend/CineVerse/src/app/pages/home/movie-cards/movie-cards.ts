import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ShowsByLocationService, ShowMovie } from '../../../../core/services/shows-by-location.service';
import { LocationStateService, SelectedLocation } from '../../../../core/services/location-state.service';



@Component({
  selector: 'app-movie-cards',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-cards.html',
  styleUrls: ['./movie-cards.css']
})


export class MovieCards implements OnInit, OnDestroy {
  movies: ShowMovie[] = [];
  isLoading = false;
  currentLocation: SelectedLocation | null = null;
  private sub = new Subscription();

  constructor(
    private showService: ShowsByLocationService,
    private router: Router,
    private locationState: LocationStateService
  ) {}

 ngOnInit(): void {
    this.sub.add(
      this.locationState.selectedLocation.subscribe(loc => {
        this.currentLocation = loc;
        if (loc) {
          this.loadMovies(loc.id);
        }
        else {
          this.movies = [];
        }
      })
    );


    const initial = this.locationState.getLocation();
    if (initial) {
      this.currentLocation = initial;
      this.loadMovies(initial.id);
    }
  }

loadMovies(locationId: number): void {
    this.isLoading = true;
    this.showService.getShowsByLocation(locationId).subscribe({
      next: (data) => {
        this.movies = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading movies by location', err);
        this.isLoading = false;
      }
    });
  }

  openMovie(movie: ShowMovie) {
    this.router.navigate(['/movie', movie.movie_id]);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
