import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-nav-bar',
  imports: [],
  templateUrl: './admin-nav-bar.html',
  styleUrl: './admin-nav-bar.css'
})
export class AdminNavBar {

  constructor(private router: Router){}
  goHome(){
      this.router.navigate(['/']);
    }

}
