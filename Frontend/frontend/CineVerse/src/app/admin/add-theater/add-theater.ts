import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminNavBar } from '../../shared/admin-nav-bar/admin-nav-bar';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-add-theater',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminNavBar, Footer],
  templateUrl: './add-theater.html',
  styleUrls: ['./add-theater.css']
})

export class AddTheater implements OnInit {
  theaterForm!: FormGroup;
  locations: any[] = [];
  isSubmitting = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    this.theaterForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      location: ['', Validators.required],
      totalscreens: [0, [Validators.required, Validators.min(1)]],
      screens: this.fb.array([])
    });

    this.fetchLocations();

    // React to total screens change
    this.theaterForm.get('totalscreens')?.valueChanges.subscribe((count) => {
      this.updateScreenForms(Number(count));
    });
  }

get screensArray(): FormArray<FormGroup> {
  return this.theaterForm.get('screens') as FormArray<FormGroup>;
}

  fetchLocations() {
    this.http.get(`${environment.apiBaseUrl}/theaters/locations/`).subscribe({
      next: (res: any) => (this.locations = res),
      error: (err) => console.error('Error fetching locations', err)
    });
  }

  updateScreenForms(count: number) {
    const screens = this.screensArray;
    screens.clear();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        screens.push(
          this.fb.group({
            screenname: [`Screen ${i + 1}`, Validators.required],
            rows: [10, [Validators.required, Validators.min(1)]],
            colomns: [10, [Validators.required, Validators.min(1)]],
          })
        );
      }
    }
  }

  submit() {
    if (this.theaterForm.invalid) {
      alert('Please fill all required fields.');
      return;
    }

    const { name, address, location, totalscreens, screens } = this.theaterForm.value;

    const theaterPayload = { name, address, location, totalscreens };
    this.isSubmitting = true;

    // 1️⃣ Create the theater
    this.http.post(`${environment.apiBaseUrl}/theaters/theaters/`, theaterPayload).subscribe({
      next: (theater: any) => {
        const theaterId = theater.id;

        // 2️⃣ Create each screen for that theater
        const screenRequests = screens.map((sc: any) =>
          this.http.post(`${environment.apiBaseUrl}/theaters/screens/`, {
            ...sc,
            theater: theaterId,
          })
        );

        // 👇 Use forkJoin instead of toPromise()
        forkJoin(screenRequests).subscribe({
          next: () => {
            alert('✅ Theater and screens added successfully');
            this.theaterForm.reset();
            this.screensArray.clear();
            this.isSubmitting = false;
          },
          error: (err) => {
            console.error('Error adding screens', err);
            alert('⚠️ Theater added, but some screens failed');
            this.isSubmitting = false;
          }
        });
      },
      error: (err) => {
        console.error('Error adding theater', err);
        alert('❌ Failed to add theater');
        this.isSubmitting = false;
      },
    });
  }

}
