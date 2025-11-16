// src/app/admin/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  addMovie(data: any) {
    return this.http.post(`${environment.apiBaseUrl}/admin-dashboard/movies/`, data);
  }

  getMovies() {
    return this.http.get(`${environment.apiBaseUrl}/admin-dashboard/movies/`);
  }

  addShow(data: any) {
    return this.http.post(`${environment.apiBaseUrl}/admin-dashboard/shows/`, data);
  }

  getShows() {
    return this.http.get(`${environment.apiBaseUrl}/admin-dashboard/shows/`);
  }
}
