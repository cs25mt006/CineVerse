import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { AdminNavBar } from '../../shared/admin-nav-bar/admin-nav-bar';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-add-show',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminNavBar, Footer],
  templateUrl: './add-show.html',
  styleUrls: ['./add-show.css']
})
export class AddShow implements OnInit {

  showForm!: FormGroup;

  movies: any[] = [];
  locations: any[] = [];
  theaters: any[] = [];
  screens: any[] = [];

  isSubmitting = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    this.showForm = this.fb.group({
      movie: ['', Validators.required],
      location: ['', Validators.required],
      theater: ['', Validators.required],
      screen: ['', Validators.required],
      date: ['', Validators.required],
      showtime: ['', Validators.required],
    });

    this.fetchMovies();
    this.fetchLocations();
  }

  fetchMovies() {
    this.http.get(`${environment.apiBaseUrl}/movies/movies/`).subscribe({
      next: (res: any) => this.movies = res,
      error: err => console.error('Error fetching movies', err)
    });
  }

  fetchLocations() {
    this.http.get(`${environment.apiBaseUrl}/theaters/locations/`).subscribe({
      next: (res: any) => this.locations = res,
      error: err => console.error('Error fetching locations', err)
    });
  }

  onLocationChange() {
    const locationId = this.showForm.value.location;
    if (!locationId) return;

    this.http.get(`${environment.apiBaseUrl}/theaters/theaters-by-location/?location_id=${locationId}`)
      .subscribe({
        next: (res: any) => {
          this.theaters = res;
          this.screens = []; // reset screens when location changes
          this.showForm.patchValue({ theater: '', screen: '' });
        },
        error: err => console.error('Error fetching theaters', err)
      });
  }

  onTheaterChange() {
    const theaterId = this.showForm.value.theater;
    if (!theaterId) return;

    this.http.get(`${environment.apiBaseUrl}/theaters/screens-by-theater/?theater_id=${theaterId}`)
      .subscribe({
        next: (res: any) => {
          this.screens = res;
          this.showForm.patchValue({ screen: '' });
        },
        error: err => console.error('Error fetching screens', err)
      });
  }

  submit() {
    if (this.showForm.invalid) {
      alert('Please fill all required fields');
      return;
    }

    const payload = {
      movie: this.showForm.value.movie,
      location: this.showForm.value.location,
      screen: this.showForm.value.screen,
      showtime: this.showForm.value.showtime,
      date: this.showForm.value.date,
    };

    this.isSubmitting = true;
    this.http.post(`${environment.apiBaseUrl}/shows/shows/`, payload)
      .subscribe({
        next: () => {
          alert('✅ Show added successfully');
          this.isSubmitting = false;
          this.showForm.reset();
        },
        error: (err) => {
          console.error(err);
          alert('❌ Failed to add show');
          this.isSubmitting = false;
        }
      });
  }
}
