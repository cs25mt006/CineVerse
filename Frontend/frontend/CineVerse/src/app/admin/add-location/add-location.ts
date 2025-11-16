import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AdminNavBar } from '../../shared/admin-nav-bar/admin-nav-bar';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-add-location',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminNavBar, Footer],
  templateUrl: './add-location.html',
  styleUrl: './add-location.css'
})
export class AddLocation {
  locationForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.locationForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  submit() {
    if (this.locationForm.invalid) {
      alert('Please enter a location name');
      return;
    }

    const payload = { name: this.locationForm.value.name };

    this.isSubmitting = true;
    this.http.post(`${environment.apiBaseUrl}/theaters/locations/`, payload)
      .subscribe({
        next: () => {
          alert('✅ Location added successfully');
          this.locationForm.reset();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          alert('❌ Failed to add location');
          this.isSubmitting = false;
        }
      });
  }
}
