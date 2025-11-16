import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Movie, MovieService } from '../../../core/services/movie.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-search',
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrls: ['./search.css']
})

export class Search implements OnInit, AfterViewInit {
  query = '';
  results: Movie[] = [];
  private searchSubject = new Subject<string>();
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;


  ngOnInit(): void {
    // Future: load recent searches or trending movies here
  }

  ngAfterViewInit(): void {
    // ensure the input has focus when the route loads
    setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
  }

   constructor(
    private movieService: MovieService,
    private router: Router
   ) {
    // Handle debounced search input
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(query => this.fetchResults(query));
  }

  onSearchChange() {
    this.searchSubject.next(this.query);
  }
  fetchResults(query: string) {
    if (!query || query.trim().length < 1) {
      this.results = [];
      return;
    }

    this.movieService.searchMovies(query).subscribe({
      next: (data) => {
        this.results = data;
      },
      error: (err) => {
        console.error('Error fetching movies:', err);
        this.results = [];
      }
    });
  }

  openMovie(id: number) {
    this.router.navigate(['/movie', id]);
  }
  
  goHome(){
    this.router.navigate(['/']);
  }

}