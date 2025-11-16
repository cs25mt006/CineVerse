import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-summary.html',
  styleUrls: ['./payment-summary.css']
})
export class PaymentSummary implements OnInit {
  showId = 0;
  movieTitle = '';
  movieId = 0;
  movieLanguage = '';
  theaterName = '';
  date = '';
  showTime = '';
  seats: any[] = [];
  totalPrice = 0;
  taxRate = 0.1; // 10%
  taxes = 0;
  grandTotal = 0;
  termsAccepted = false;

  constructor(
    private router: Router, 
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const state = history.state;

    if (state) {
      this.movieTitle = state.movieTitle;
      this.movieLanguage = state.movieLanguage;
      this.theaterName = state.theaterName;
      this.date = state.date;
      this.showTime = state.showTime;
      this.seats = state.selectedSeats || [];
      this.totalPrice = state.totalPrice || 0;
      this.showId = state.showId || 0;
      this.movieId = state.movieId || 0;
    }

    this.calculateTotals();
  }

  calculateTotals() {
    this.taxes = Math.round(this.totalPrice * this.taxRate);
    this.grandTotal = this.totalPrice + this.taxes;
  }

  payNow() {
    if (!this.termsAccepted) {
      alert('Please accept the Terms and Conditions.');
      return;
    }

    //alert('Booking confirmed! 🎟️');
    this.router.navigate(['/payment/process'], {
      state: {
        amount: this.grandTotal,
        movieTitle : this.movieTitle,
        movieLanguage : this.movieLanguage,
        theaterName : this.theaterName,
        date : this.date,
        showTime : this.showTime,
        seats : this.seats,
        showId : this.showId,
        movieId: this.movieId
      }
    });
  }

  getSeatLabels(): string {
    if (!this.seats || this.seats.length === 0) return '—';

    return this.seats
      .sort((a, b) => a.rownumber - b.rownumber || a.colomnnumber - b.colomnnumber)
      .map(seat => `${String.fromCharCode(65 + seat.rownumber - 1)}${seat.colomnnumber}`)
      .join(', ');
  }





  formatTime(time: string): string {
    if (!time) return '';
    const d = new Date(`1970-01-01T${time}`);
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(/am|pm/, match => match.toUpperCase());
  }

  goBack() {
    this.router.navigate(['/seats', this.showId],{
      state: {
      movieTitle: this.movieTitle,
      movieLanguage: this.movieLanguage,
      theaterName: this.theaterName,
      date: this.date,
      showTime: this.showTime,
      totalPrice: this.totalPrice,
      showId: this.showId, 
      movieId: this.movieId,
      }
    });
  }
}
