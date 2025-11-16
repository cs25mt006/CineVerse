import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AdminNavBar } from '../../shared/admin-nav-bar/admin-nav-bar';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-edit-shows',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavBar, Footer],
  templateUrl: './edit-shows.html',
  styleUrls: ['./edit-shows.css']
})
export class EditShows implements OnInit {

  locations: any[] = [];
  movies: any[] = [];
  shows: any[] = [];
  theaters: any[] = [];
  selectedTheater: number | null = null;
  filteredShows: any[] = [];


  selectedLocation: number | null = null;
  selectedMovie: number | null = null;

  expandedShowId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations() {
    this.http.get<any[]>(`${environment.apiBaseUrl}/theaters/locations/`)
      .subscribe(res => this.locations = res);
  }

  onLocationSelect() {
    this.movies = [];
    this.shows = [];
    this.selectedMovie = null;

    this.http.get<any[]>(
      `${environment.apiBaseUrl}/shows/movies-by-location/?location_id=${this.selectedLocation}`
    ).subscribe(res => this.movies = res);
  }

  
  

  
  
  
  
  onMovieSelect() {
    this.shows = [];
    this.theaters = [];
    this.selectedTheater = null;
    this.filteredShows = [];

    this.http.get<any[]>(
      `${environment.apiBaseUrl}/shows/shows-by-movie/?movie_id=${this.selectedMovie}&location_id=${this.selectedLocation}`
    ).subscribe(res => {

      this.shows = res;

      
      const theaterMap: any = {};
      res.forEach(show => {
        theaterMap[show.theater.id] = show.theater.name;
      });

      this.theaters = Object.keys(theaterMap).map(id => ({
        id: Number(id),
        name: theaterMap[id]
      }));
    });
  }

  onTheaterSelect() {
    if (!this.selectedTheater) {
      this.filteredShows = [];
      return;
    }

    const tid = Number(this.selectedTheater);
    this.filteredShows = this.shows.filter(s => Number(s.theater?.id) === tid);

    console.log('Selected theater id:', tid);
    console.log('Filtered shows:', this.filteredShows);
  }

  toggleExpand(show: any) {
    this.expandedShowId = this.expandedShowId === show.id ? null : show.id;
  }

  saveChanges(show: any) {
    const payload = {
      movie: show.movie,
      screen: show.screen,
      date: show.date,
      showtime: show.showtime
    };

    this.http.patch(
      `${environment.apiBaseUrl}/shows/shows/${show.id}/`,
      payload
    ).subscribe({
      next: () => alert("Show updated successfully!"),
      error: () => alert("Failed to update show.")
    });
  }
}
