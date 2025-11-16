import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LocationSearchComponent } from './shared/location-search/location-search';
import { LocationStateService } from '../core/services/location-state.service';
import { CommonModule } from '@angular/common';
import { Navbar } from './shared/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  // imports: [RouterOutlet, LocationSearchComponent, CommonModule, Navbar],
  imports: [RouterOutlet, LocationSearchComponent, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})


export class App implements OnInit {
  title = 'CineVerse';

  constructor(private locationState: LocationStateService) {}

  ngOnInit(): void {
    // If there's no location selected yet, request the modal to open immediately
    if (!this.locationState.hasLocation()) {
      this.locationState.requestOpenModal();
    }
  }
}
