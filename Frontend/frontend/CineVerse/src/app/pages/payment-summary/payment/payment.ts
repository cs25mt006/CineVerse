import { Component, OnInit, OnDestroy } from '@angular/core';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../../../core/services/booking.service';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class Payment implements OnInit, OnDestroy {
  stripe: Stripe | null = null;
  cardElement!: StripeCardElement;
  elements: any;
  clientSecret = '';
  amount = 0;
  message = '';
  movieTitle = '';
  movieLanguage = '';
  theaterName = ''; 
  date = '';
  showTime = '';
  seats : any[] = [];
  showId=0;
  userId=0;
  movieId=0;
    isProcessing = false;
  isError = false;
  freezeUI = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private bookingService: BookingService,
    private auth: AuthService
  ) {}

  async ngOnInit() {

    const state = history.state;
    if (state?.amount) {
      this.amount = state.amount*100;
      console.log('✅ Received amount from previous page:', this.amount);
    } else {
      console.warn('⚠️ No amount passed — defaulting to ₹500');
      this.amount = 50000; 
    }
    if (state) {
      this.movieTitle = state.movieTitle;
      this.movieLanguage = state.movieLanguage;
      this.theaterName = state.theaterName;
      this.date = state.date;
      this.showTime = state.showTime;
      this.seats = state.seats;
      this.showId = state.showId;
      this.movieId = state.movieId;
    }


    this.stripe = await loadStripe('pk_test_51SRxV1RwWId9P9WNYxA5UdrenvOMaEZjQKkJwSlKOoNPeOGlssyrWtRUMcqU9gw2cjQBt4km5BBghQEy9Q6uA7WF00Nx0MW2rC');
    if (!this.stripe) {
      console.error('❌ Stripe failed to initialize');
      this.message = 'Stripe failed to initialize';
      return;
    }


    this.elements = this.stripe.elements();
    this.cardElement = this.elements.create('card');
    this.cardElement.mount('#card-element');
  }

  ngOnDestroy(): void {

    if (this.cardElement) {
      this.cardElement.unmount();
    }
  }

  async pay() {
    if (!this.stripe || !this.cardElement) {
      this.message = 'Stripe not ready';
      this.isError = true;
      return;
    }
    this.isProcessing = true;
    this.freezeUI = true;
    this.isError = false;
    this.message = 'Processing payment...';

    try {

      const res: any = await this.http.post(
        `${environment.apiBaseUrl}/payments/create-payment-intent/`,
        { amount: this.amount }
      ).toPromise();

      const clientSecret = res?.clientSecret;
      if (!clientSecret) {
        this.message = '❌ No client secret from backend';
        return;
      }

      console.log('✅ Client secret received:', clientSecret);


      const { paymentIntent, error } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: { name: 'Test User' }, 
        },
      });

      if (error) {
        console.error('Stripe error:', error);
        this.message = `❌ ${error.message}`;
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Payment successful:', paymentIntent);
        this.message = '✅ Payment successful!';
        this.isError = false;
        this.isProcessing = false;
        alert('✅ Payment successful!');


        const paymentId = paymentIntent.id;
        const user = this.auth.getUser();
        this.userId = user?.user_id || 0;
        const lockedSeatIds = this.seats.map((s: any) => s.locked_seat_id);

        this.bookingService.bookSeats(this.showId, lockedSeatIds).subscribe({
          next: (bookRes) => {
            console.log('Seats booked successfully:', bookRes);

            this.bookingService.createBooking(
              this.userId,
              lockedSeatIds,
              this.amount,
              this.showId,
              paymentId
            ).subscribe({
              next: (bookingRes) => {
                console.log('Booking created successfully:', bookingRes);

                if (bookingRes.success) {
                  this.router.navigate(['/booking/confirm'], {
                    state: {
                      amount: this.amount,
                      movieTitle: this.movieTitle,
                      movieLanguage: this.movieLanguage,
                      theaterName: this.theaterName,
                      date: this.date,
                      showTime: this.showTime,
                      seats: this.seats,
                      bookingId: bookingRes.booking_id,
                      movieId: this.movieId
                    },
                    replaceUrl: true
                  });
                } else {
                  alert('Booking creation failed.');
                }
              },
              error: (err) => {
                console.error('Error creating booking:', err);
                alert('❌ Error creating booking.');
              }
            });
          },
          error: (err) => {
            console.error('Error booking seats:', err);
            alert('❌ Error booking seats. Try again.');
          }
        });
        
      } else {
        console.log('Payment intent status:', paymentIntent?.status);
        this.message = 'Processing...';
      }

    } catch (err) {
      console.error('Backend or Stripe error:', err);
      this.message = '❌ Payment failed. Try again.';
      this.isError = true;
      this.isProcessing = false;
      this.router.navigate(['/']);
    }
  }












}
