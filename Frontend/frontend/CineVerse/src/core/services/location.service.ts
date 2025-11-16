import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LocationItem {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private http: HttpClient) {}

  searchLocations(query: string): Observable<LocationItem[]> {
    // call the backend location search endpoint; encode the query
    const q = encodeURIComponent(query || '');
    return this.http.get<LocationItem[]>(`${environment.apiBaseUrl}/theaters/locations/search/?q=${q}`);
  }
}
