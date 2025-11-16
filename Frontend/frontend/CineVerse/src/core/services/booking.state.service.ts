import { Injectable } from '@angular/core';

export interface BookingProgress {
  showId: number;
  movieId?: number;
  selectedSeats: any[];   // SeatStatus[]
  totalPrice: number;
  lockedSeatIds?: number[]; // seat lock ids returned by backend (if any)
  // you can add expiresAt?: string later when backend returns it
}

@Injectable({ providedIn: 'root' })
export class BookingStateService {
  private data: BookingProgress | null = null;

  set(data: BookingProgress) { this.data = data; }
  get(): BookingProgress | null { return this.data; }
  clear() { this.data = null; }

  setPendingSelection(data: any) {
    sessionStorage.setItem('pending_booking', JSON.stringify(data));
  }

  getPendingSelection() {
    const data = sessionStorage.getItem('pending_booking');
    return data ? JSON.parse(data) : null;
  }

  clearPendingSelection() {
    sessionStorage.removeItem('pending_booking');
  }

}
