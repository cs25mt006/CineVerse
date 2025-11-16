import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LocationStateService } from '../../../core/services/location-state.service';
import { Subscription } from 'rxjs';
import { AuthService, LoginResponse } from '../../../core/services/auth.service';
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit, OnDestroy {
  selectedRegion: string | null = null;
  // keep the full user object so templates can access properties like `name`
  currentUser: any | null = null;
  private subs = new Subscription();
  isUserDropdownOpen = false;
  private clickUnlisten: (() => void) | null = null;

  constructor(
    public router: Router,
    private locationState: LocationStateService,
    private auth: AuthService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.locationState.selectedLocation.subscribe(loc => (this.selectedRegion = loc ? loc.name : null))
    );

    // subscribe to auth user stream and add to subscription container so it's cleaned up
    this.subs.add(
      this.auth.user$.subscribe((user) => {
        this.currentUser = user ?? null;
      })
    );

    // listen for clicks outside the dropdown to close it
    this.clickUnlisten = this.renderer.listen(this.document, 'click', (ev: Event) => {
      const path = ev.composedPath ? ev.composedPath() : (ev as any).path || [];
      // if dropdown is open and click is outside the navbar user area, close it
      if (this.isUserDropdownOpen) {
        const clickedInside = path.some((el: any) => {
          try { return el && el.classList && el.classList.contains && el.classList.contains('user-dropdown-root'); } catch { return false; }
        });
        if (!clickedInside) this.isUserDropdownOpen = false;
      }
    });
  }


  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.clickUnlisten) this.clickUnlisten();
  }

  goHome() {
    this.router.navigate(['/']);
  }

  onSearchFocus() {
    this.router.navigate(['/search']);
  }

  gotoLogin(){
    // navigate to login and include the current URL so we can return after successful login
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  }

  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  gotoProfile() {
    this.isUserDropdownOpen = false;
    this.router.navigate(['/profile']);
  }

  openRegionPopup() {
    this.locationState.requestOpenModal();
  }


  logout() {
    this.isUserDropdownOpen = false;
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
