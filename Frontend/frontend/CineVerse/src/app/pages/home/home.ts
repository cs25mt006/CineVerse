import { Component } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { MovieCards } from './movie-cards/movie-cards';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-home',
  imports: [Navbar, MovieCards, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}