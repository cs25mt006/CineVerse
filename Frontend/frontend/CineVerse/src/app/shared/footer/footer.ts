import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone:true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  isAdmin = false;
  constructor( 
    private auth: AuthService
  ) {
    console.log("IS ADMIN FROM SERVICE:", this.auth.isAdmin());
    this.auth.adminStatus$.subscribe(
      value => this.isAdmin = value
    );
  }

  
}
