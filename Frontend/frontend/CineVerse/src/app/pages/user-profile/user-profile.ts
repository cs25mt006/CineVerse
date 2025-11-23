import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { environment } from '../../../environments/environment';
import { RecommenderService } from '../../../core/services/recommender.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, FormsModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfile implements OnInit {
  user: any = null;
  orders: any[] = [];
  activeTab: 'profile' | 'orders' | 'reco' = 'profile';
  isLoading = false;


  // genreList: string[] = [
  //   'Action','Comedy','Drama','Horror','Sci-Fi','Romance','Thriller',
  //   'Adventure','Animation','Fantasy','Crime','Mystery'
  // ];

    genreList: string[] = [
    'Action','Comedy','Horror','Sci-Fi','Romance','Thriller',
    'Adventure','Animation','Fantasy','Crime','Mystery'
  ];


  selectedGenre: string = '';
  recommendedMovies: any[] = [];
  watchedMovieIds: number[] = [];
  isRecoLoading = false;

  constructor(
    private http: HttpClient,
    private recommender: RecommenderService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData() {
    const stored = sessionStorage.getItem('user_data');
    if (stored) {
      this.user = JSON.parse(stored);
    }
  }

  setActiveTab(tab: 'profile' | 'orders' | 'reco') {
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
        })).reverse();
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
  buildPosterUrl(path: string | null): string {
    if (!path) return 'assets/placeholder.png';
    return 'https://image.tmdb.org/t/p/w500' + path;
  }
  loadWatchedHistory() {
    if (this.orders.length > 0) {
      this.watchedMovieIds = this.orders.map(o => o.movie_id);
    }
  }

  async generateRecommendations() {
    if (!this.selectedGenre) {
      alert("Please select a genre!");
      return;
    }

    this.isRecoLoading = true;
    this.recommendedMovies = [];

    try {
      const recs = await this.recommender.getRecommendations({
        watchedIds: this.watchedMovieIds,
        preferredGenres: [this.selectedGenre],
        resultCount: 20
      });

      this.recommendedMovies = recs;
    } catch (err) {
      console.error("Recommendation error:", err);
    }

    this.isRecoLoading = false;
  }
  




}




