import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, Subject, of, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs';
import { LocationStateService, SelectedLocation } from '../../../core/services/location-state.service';
import { LocationService, LocationItem } from '../../../core/services/location.service';

@Component({
  selector: 'app-location-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-search.html',
  styleUrls: ['./location-search.css']
})
export class LocationSearchComponent {
  searchQuery: string = '';
  isModalOpen: boolean = false;
  hasResults: boolean = true;
  results: LocationItem[] = [];
  popularCities: LocationItem[] = [
    { id: 7, name: 'Mumbai' },
    { id: 6, name: 'Delhi' },
    { id: 5, name: 'Bangalore' },
    { id: 4, name: 'Vizag' },
    { id: 55, name: 'Chennai' },
    { id: 2, name: 'Hyderabad' }
  ];
  private subs = new Subscription();
  private searchSubject = new Subject<string>();
  loading: boolean = false;

  constructor(private locationState: LocationStateService, private locationService: LocationService) {}

  ngOnInit(): void {
    // open modal when service requests it
    this.subs.add(this.locationState.openModal.subscribe(() => this.openModal()));

    // listen for typed queries and perform a debounced search
    this.subs.add(
      this.searchSubject
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((q) => {
            const term = (q || '').trim();
            if (!term) return of([] as LocationItem[]);
            this.loading = true;
            return this.locationService.searchLocations(term).pipe(
              catchError((err) => {
                console.error('Location search error', err);
                return of([] as LocationItem[]);
              })
            );
          })
        )
        .subscribe((data: LocationItem[]) => {
          this.loading = false;
          this.results = data || [];
          this.hasResults = this.results.length > 0;
        })
    );

    // If location already set, ensure modal is closed
    if (this.locationState.hasLocation()) {
      this.isModalOpen = false;
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  openModal() {
    this.isModalOpen = true;
    // reset inputs/results when opening
    this.searchQuery = '';
    this.results = [];
    this.hasResults = true;
  }

  onSearchChange() {
    this.searchSubject.next(this.searchQuery || '');
  }

  onOverlayClick() {
    // Prevent closing the modal if user hasn't selected a location yet
    if (this.locationState.hasLocation()) {
      this.closeModal();
    }
    // otherwise ignore clicks on overlay to force selection
  }

  closeModal() {
    this.isModalOpen = false;
    this.searchQuery = '';
    this.results = [];
  }

  searchLocation() {
    // trigger an immediate search when user presses Enter
    this.searchSubject.next(this.searchQuery || '');
  }

  selectCity(city: LocationItem) {
    console.log('Selected city:', city);
    const sel: SelectedLocation = { id: city.id, name: city.name };
    this.locationState.setLocation(sel);
    this.closeModal();
  }
}