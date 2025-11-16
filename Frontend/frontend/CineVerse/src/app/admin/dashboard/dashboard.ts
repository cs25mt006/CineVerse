import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminNavBar } from '../../shared/admin-nav-bar/admin-nav-bar';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-dashboard',
  imports: [AdminNavBar, Footer],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  constructor(private router: Router){}

    navigate(path: string) {
      this.router.navigate([`/admin/${path}`]);
    }
    
}
