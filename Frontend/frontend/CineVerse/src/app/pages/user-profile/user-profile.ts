import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfile implements OnInit {
  user: any = null;
  orders: any[] = [];
  activeTab: 'profile' | 'orders' = 'profile';
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData() {
    const stored = sessionStorage.getItem('user_data');
    if (stored) {
      this.user = JSON.parse(stored);
    }
  }

  setActiveTab(tab: 'profile' | 'orders') {
    this.activeTab = tab;
    if (tab === 'orders') {
      this.fetchUserOrders();
    }
  }

  fetchUserOrders() {
    if (!this.user?.user_id) return;

    this.isLoading = true;
    const url = `${environment.apiBaseUrl}/bookings/seats/your-orders/?user_id=${this.user.user_id}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        const rawOrders = res.results || res || [];
        this.orders = rawOrders.map((o: any) => ({
          ...o,
          formattedSeats: this.formatSeats(o.seats),
          formattedTime: this.formatTime(o.showtime),
          formattedDate: this.formatDate(o.date)
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.isLoading = false;
      }
    });
  }


  formatSeats(seats: any[]): string {
    return seats
      .map((s: any) => `${String.fromCharCode(65 + s.rownumber - 1)}${s.colomnnumber}`)
      .join(', ');
  }


  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTime(timeStr: string): string {
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const formatted = ((h + 11) % 12 + 1) + ':' + minute;
    return `${formatted} ${suffix}`;
  }
}
