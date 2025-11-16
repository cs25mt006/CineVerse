// src/app/admin/add-movie/add-movie.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { AdminNavBar } from '../../shared/admin-nav-bar/admin-nav-bar';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-add-movie',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminNavBar, Footer],
  templateUrl: './add-movie.html',
  styleUrls: ['./add-movie.css']
})
export class AddMovie {

  movieForm!: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

    ngOnInit() {
      this.movieForm = this.fb.group({
        title: ['', Validators.required],
        description: ['', Validators.required],
        releasedate: ['', Validators.required],
        cast: ['', Validators.required],
        duration: ['', Validators.required],
        genre: ['', Validators.required],
        language: ['', Validators.required],
        revenue: [0, Validators.required],
        poster: [null, Validators.required]
      });
    }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.movieForm.patchValue({ poster: file });
    }
  }

  submit() {
    if (this.movieForm.invalid || !this.selectedFile) {
      alert('Please fill all required fields');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();

    Object.entries(this.movieForm.value).forEach(([key, value]) => {
      if (key === 'poster' && this.selectedFile) {
        formData.append('poster', this.selectedFile, this.selectedFile.name);
      } else {
        formData.append(key, value as any);
      }
    });

    this.http.post(`${environment.apiBaseUrl}/movies/movies/`, formData)
      .subscribe({
        next: () => {
          alert('✅ Movie added successfully');
          this.movieForm.reset();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          alert('❌ Failed to add movie');
          this.isSubmitting = false;
        }
      });
  }
}
