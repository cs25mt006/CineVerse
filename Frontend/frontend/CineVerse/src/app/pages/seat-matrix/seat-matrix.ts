import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService, SeatStatus } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { BookingStateService } from '../../../core/services/booking.state.service';


@Component({
  selector: 'app-seat-matrix',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-matrix.html',
  styleUrls: ['./seat-matrix.css']
})
export class SeatMatrix implements OnInit {
  showId!: number;
  movieId!: number;
  locationId!: number;
  movieTitle = '';
  movieLanguage = '';
  theaterName = '';
  showTime = '';
  date = '';

  isLocking = false;

  seats: SeatStatus[] = [];
  groupedSeats: { [price: number]: { [rowLabel: string]: SeatStatus[] } } = {};

  selectedSeats: SeatStatus[] = [];
  maxSelectableSeats: number = 0;
  totalPrice: number = 0;

  isLoading = true;
  isSeatCountDialogOpen = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private bookingState: BookingStateService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.showId = Number(this.route.snapshot.paramMap.get('showId'));

    const navState = history.state;
    this.movieId = navState.movieId;
    this.locationId = navState.locationId;
    this.movieTitle = navState.movieTitle || '';
    this.movieLanguage = navState.movieLanguage;
    this.theaterName = navState.theaterName || '';
    this.date = navState.date || '';
    this.showTime = navState.showTime || '';
    if (!this.showId) {
      console.error('Invalid showId');
      return;
    }
    this.isSeatCountDialogOpen = true;
    this.fetchSeatStatus();
  }

  /** Fetch seat status from API */
  fetchSeatStatus() {
    this.isLoading = true;
    this.bookingService.getSeatsForShow(this.showId).subscribe({
      next: (data) => {
        this.seats = data;
        this.groupSeats();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching seat status:', err);
        this.isLoading = false;
      }
    });
  }


  getColumnCount(priceGroup: { [rowLabel: string]: SeatStatus[] }): number {
    if (!priceGroup) return 0;
    let maxCols = 0;
    for (const row of Object.values(priceGroup)) {
      if (row.length > maxCols) maxCols = row.length;
    }
    return maxCols;
  }

  /** Group seats by price and row (A, B, C, etc.) */
  groupSeats() {
    const grouped: { [price: number]: { [rowLabel: string]: SeatStatus[] } } = {};

    for (const seat of this.seats) {
      const price = seat.price;
      const rowLabel = String.fromCharCode(65 + seat.rownumber - 1);

      if (!grouped[price]) grouped[price] = {};
      if (!grouped[price][rowLabel]) grouped[price][rowLabel] = [];

      grouped[price][rowLabel].push(seat);
    }

    // Sort rows and columns
    for (const price of Object.keys(grouped)) {
      for (const row of Object.keys(grouped[Number(price)])) {
        grouped[Number(price)][row].sort((a, b) => a.colomnnumber - b.colomnnumber);
      }
    }

    this.groupedSeats = grouped;
  }

  /** Check if a seat is selected */
  isSelected(seat: SeatStatus): boolean {
    return this.selectedSeats.some((s) => s.seat_id === seat.seat_id);
  }

  /** Toggle seat selection */
  selectSeat(seat: SeatStatus) {
    if (seat.status !== 'available') return;

    const alreadySelected = this.isSelected(seat);

    if (alreadySelected) {
      this.selectedSeats = this.selectedSeats.filter((s) => s.seat_id !== seat.seat_id);
    } else {
      if (this.maxSelectableSeats && this.selectedSeats.length >= this.maxSelectableSeats) return;
      this.selectedSeats.push(seat);
    }

    this.updateTotalPrice();
  }

  /** Calculate total price */
  updateTotalPrice() {
    this.totalPrice = this.selectedSeats.reduce((sum, s) => sum + s.price, 0);
  }

  /** Seat count selector */
  openSeatCountDialog() {
    this.isSeatCountDialogOpen = true;
  }

  setSeatCount(count: number) {
    this.maxSelectableSeats = count;
    this.isSeatCountDialogOpen = false;
    this.selectedSeats = [];
    this.totalPrice = 0;
  }

  formatTime(time: string): string {
    if (!time) return '';
    const d = new Date(`1970-01-01T${time}`);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
            .replace(/am|pm/, match => match.toUpperCase());
  }


  /** Pay Now */
  bookNow() {
    if (this.selectedSeats.length === 0) {
      alert('Please select seats before proceeding.');
      return;
    }
    if (!this.auth.isLoggedIn()) {

      // Save everything
      this.bookingState.setPendingSelection({
        showId: this.showId,
        movieId: this.movieId,
        movieTitle: this.movieTitle,
        movieLanguage: this.movieLanguage,
        theaterName: this.theaterName,
        date: this.date,
        showTime: this.showTime,
        selectedSeats: this.selectedSeats,
        totalPrice: this.totalPrice,
      });

      // Redirect to login
      this.router.navigate(['/login'], {
        state: { returnUrl: `/seats/${this.showId}` }
      });

      return;
    }


    // If user IS logged in → proceed with seat locking API
    const seatIds = this.selectedSeats.map(s => s.locked_seat_id);
    this.isLocking = true;

    this.bookingService.lockSeats(this.showId, seatIds).subscribe({
      next: (res) => {
        this.isLocking = false;
        console.log('Lock success:', res);

        // Navigate to payment summary page
        this.router.navigate(['/payment'], {
          state: {
            movieTitle: this.movieTitle,
            movieId: this.movieId,
            movieLanguage: this.movieLanguage,
            theaterName: this.theaterName,
            date: this.date,
            showTime: this.showTime,
            selectedSeats: this.selectedSeats,
            totalPrice: this.totalPrice,
            showId: this.showId
          }
        });
      },
      error: (err) => {
        this.isLocking = false;
        console.error('Lock error:', err);
        alert('Failed to lock seats. Please try again.');
      }
    });
  }


  goBack() {
    if (this.movieId) {
    this.router.navigate(['/shows', this.movieId]);
    }
    else {
      this.router.navigate(['/']);
    }
  }

}
