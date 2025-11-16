
import { Routes } from '@angular/router';
import { AddMovie } from './add-movie/add-movie';
import { AddShow } from './add-show/add-show';
import { AddTheater } from './add-theater/add-theater';
import { Dashboard } from './dashboard/dashboard';
import { AddLocation } from './add-location/add-location';
import { MovieRevenue } from './movie-revenue/movie-revenue';
import { EditShows } from './edit-shows/edit-shows';

export const ADMIN_ROUTES: Routes = [
  {path: '', component: Dashboard},
  { path: 'add-movie', component: AddMovie},
  { path: 'add-show', component: AddShow },
  { path: 'add-theater', component: AddTheater},
  { path: 'add-location', component: AddLocation},
  { path: 'movie-revenue', component: MovieRevenue},
  { path: 'edit-show', component: EditShows}
];
