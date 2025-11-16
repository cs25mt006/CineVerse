import { Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { Search } from './pages/search/search';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { MovieDetails } from './pages/movie-details/movie-details';
import { UserProfile } from './pages/user-profile/user-profile';
import { Shows } from './pages/shows/shows';
import { SeatMatrix } from './pages/seat-matrix/seat-matrix';
import { PaymentSummary } from './pages/payment-summary/payment-summary';
import { Payment } from './pages/payment-summary/payment/payment';
import { BookingConfirmation } from './pages/booking-confirmation/booking-confirmation';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'search', component: Search },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'movie/:id', component: MovieDetails },
  { path: 'profile', component: UserProfile, canActivate: [AuthGuard] },
  { path: 'shows/:movieId', component: Shows },
  { path: 'seats/:showId', component: SeatMatrix },
  { path: 'payment', component: PaymentSummary, canActivate: [AuthGuard] },
  { path: 'payment/process', component: Payment, canActivate: [AuthGuard] },
  { path: 'booking/confirm', component: BookingConfirmation, canActivate: [AuthGuard]},
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin-routing.module').then((m) => m.ADMIN_ROUTES)
  }
  // add other routes here
];