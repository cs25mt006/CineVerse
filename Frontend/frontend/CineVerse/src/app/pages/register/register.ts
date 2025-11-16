import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {

  username = '';
  password = '';
  confirmPassword = '';
  email = '';
  firstName = '';
  lastName = '';
  gender = '';
  termsAccepted = false;
  isSubmitting = false;

  constructor(private router: Router, private auth: AuthService) {}
  register() {

    if (this.isSubmitting) return;

    const newUser = {
      username: this.username,
      password: this.password,
      email: this.email,
      first_name: this.firstName,
      last_name: this.lastName,
      gender: this.gender
    };

    if (!this.termsAccepted) {
      alert('Please accept terms and conditions.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    this.isSubmitting = true;
    this.auth.registerUser(newUser).subscribe({
          next: (res) => {
            console.log('Registered Successfully:', res);
            alert('Registration successful!');
            this.router.navigate(['/login']);
          },
          error: (err) => {
            console.error('Registration failed:', err);
            alert('Something went wrong while registering.');
          }
        });
 
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goHome(){
    this.router.navigate(['/']);
  }

}
