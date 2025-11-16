import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../../core/services/movie.service';
import { ShowsByLocationService } from '../../../core/services/shows-by-location.service';
import { LocationStateService, SelectedLocation } from '../../../core/services/location-state.service';
import { Navbar } from '../../shared/navbar/navbar';
import { BookingService, SeatStatus } from '../../../core/services/booking.service';
import { forkJoin, map, Subscription } from 'rxjs';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-shows',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './shows.html',
  styleUrls: ['./shows.css']
})
export class Shows implements OnInit, OnDestroy {
  movieId!: number;
  movieTitle = '';
  movieLanguage = '';

  dateList: { label: string; date: string; iso: string }[] = [];
  selectedDate = '';
  isLoading = false;

  shows: any[] = [];
  showsByDate: { [date: string]: any[] } = {};
  groupedShows: { [theaterName: string]: any[] } = {};

  currentLocation: SelectedLocation | null = null;
  private subs = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private movieService: MovieService,
    private showsService: ShowsByLocationService,
    private locationState: LocationStateService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.movieId = Number(this.route.snapshot.paramMap.get('movieId'));
    this.fetchMovieDetails();
    this.generateNext7Days();
    this.selectedDate = this.dateList[0].iso;

    // Subscribe to location changes
    this.subs.add(
      this.locationState.selectedLocation.subscribe(loc => {
        if (!loc) return;
        const locationChanged = !this.currentLocation || this.currentLocation.id !== loc.id;
        this.currentLocation = loc;

        if (locationChanged) {
          this.fetchShows();
        }
      })
    );

    // Initial load if location already exists
    const initial = this.locationState.getLocation();
    if (initial) {
      this.currentLocation = initial;
      this.fetchShows();
    } else {
      alert('Please select a location first.');
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /** Fetch movie details */
  fetchMovieDetails() {
    this.movieService.getMovieDetails(this.movieId).subscribe({
      next: (data) => {
        this.movieTitle = data.title;
        this.movieLanguage = data.language;
      },
      error: (err) => console.error('Error fetching movie details:', err)
    });
  }

  /** Generate Next 7 Dates */
  generateNext7Days() {
    const today = new Date();
    this.dateList = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const day = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const dateNum = d.getDate().toString().padStart(2, '0');
      const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      const iso = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;

      this.dateList.push({ label: day, date: `${dateNum} ${month}`, iso });
    }
  }

  /** Format time to 12hr format */
  getFormattedTime(timeString: string): string {
    if (!timeString) return '';
    try {
      const time = timeString.includes('T')
        ? new Date(timeString)
        : new Date(`1970-01-01T${timeString}`);
      return time
        .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        .replace(/am|pm/, (m) => m.toUpperCase());
    } catch {
      return timeString;
    }
  }

  /** Fetch all shows for movie and location */
  fetchShows() {
    if (!this.currentLocation) return;
    this.isLoading = true;

    this.showsService.getShowsByMovie(this.movieId, this.currentLocation.id).subscribe({
      next: (data) => {
        // Always reset
        this.shows = [];
        this.showsByDate = {};
        this.groupedShows = {};

        if (!data || data.length === 0) {
          this.isLoading = false;
          return; // no shows -> blank state visible
        }

        this.shows = data;

        // Fetch seat statuses
        const seatCalls = this.shows.map(show =>
          this.bookingService.getSeatsForShow(show.id).pipe(
            map((seats: SeatStatus[]) => {
              const total = seats.length || 1;
              const booked = seats.filter(s => s.status !== 'available').length;
              const percent = (booked / total) * 100;

              if (percent >= 100) show.status = 'unavailable';
              else if (percent >= 70) show.status = 'fast';
              else show.status = 'available';
              return show;
            })
          )
        );

        forkJoin(seatCalls).subscribe({
          next: (updatedShows) => {
            this.shows = updatedShows;
            this.sortShowsByDate();
            this.filterShowsBySelectedDate();
            this.isLoading = false;
          },
          error: () => {
            this.sortShowsByDate();
            this.filterShowsBySelectedDate();
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching shows:', err);
        this.isLoading = false;
      }
    });
  }

  /** Sort shows by date */
  sortShowsByDate() {
    this.showsByDate = {};
    for (const show of this.shows) {
      const date = show.date || show.showtime.split('T')[0];
      if (!this.showsByDate[date]) this.showsByDate[date] = [];
      this.showsByDate[date].push(show);
    }
  }

  /** Handle date click */
  selectDate(dateIso: string) {
    if (this.selectedDate === dateIso) return;
    this.selectedDate = dateIso;
    this.filterShowsBySelectedDate();
  }

  /** Filter by selected date */
  filterShowsBySelectedDate() {
    const showsForDate = this.showsByDate[this.selectedDate] || [];
    this.groupShowsByTheater(showsForDate);
  }

  /** Group shows by theater name */
  groupShowsByTheater(showsForDate: any[]) {
    this.groupedShows = {};
    for (const show of showsForDate) {
      const theaterName = show.theater?.name || 'Unknown Theater';
      if (!this.groupedShows[theaterName]) this.groupedShows[theaterName] = [];
      this.groupedShows[theaterName].push(show);
    }
  }

  /** Navigate to seat matrix */
  goToSeatMatrix(showId: number, show: any) {
    if (!showId) return;
    this.router.navigate(['/seats', showId], {
      state: {
        movieId: this.movieId,
        locationId: this.currentLocation?.id,
        movieTitle: this.movieTitle,
        movieLanguage: this.movieLanguage,
        theaterName: show.theater?.name,
        date: show.date,
        showTime: show.showtime
      }
    });
  }
}
