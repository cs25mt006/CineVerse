import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SeatStatus {
  seat_id: number;
  locked_seat_id: number ;
  status: string; // e.g. "available" | "booked" | "locked" | "reserved"
  rownumber: number;
  colomnnumber: number;
  seattype: string; // e.g. "regular", "premium"
  price: number;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private http: HttpClient) {}

  getSeatsForShow(showId: number): Observable<SeatStatus[]> {
    const url = `${environment.apiBaseUrl}/bookings/seats/status/?show_id=${showId}`;
    return this.http.get<SeatStatus[]>(url);
  }

  lockSeats(showId: number, lockedSeatIds: number[]): Observable<any> {
    const body = {
      show_id: showId,
      locked_seat_ids: lockedSeatIds
    };
    return this.http.post<any>(`${environment.apiBaseUrl}/bookings/seats/lock/`, body);
  }

  bookSeats(showId: number, lockedSeatIds: number[]): Observable<any> {
    const body = {
      show_id: showId,
      locked_seat_ids: lockedSeatIds
    };
    return this.http.post<any>(`${environment.apiBaseUrl}/bookings/seats/book/`, body);
  }

  createBooking(userId: number, lockedSeatIds: number[], amount: number, showId: number, paymentId: string): Observable<any> {
    const body = {
      user_id: userId,
      locked_seat_ids: lockedSeatIds,
      totalamount: amount,
      show_id: showId,
      payment_id: paymentId
    };
    return this.http.post<any>(`${environment.apiBaseUrl}/bookings/seats/create-booking/`,body);
  }
}
