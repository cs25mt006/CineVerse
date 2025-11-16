import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email: string = '';
  password: string = '';
  isSubmitting = false;

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  login() {
    if (!this.email || !this.password) {
      alert('Please enter both email and password.');
      return;
  }
  if (this.isSubmitting) return;
  this.isSubmitting = true;
  const credentials = {
      email: this.email,
      password: this.password
    };


    this.auth.loginUser(credentials.email, credentials.password).subscribe({
      next: (res) => {
        console.log('Login success:', res);
        alert('Login successful!');
        this.auth.setAdminStatus();  
        const state = history.state;

        if (state && state.returnShowId) {
          this.router.navigate(['/seats', state.returnShowId],{state});
          return;
        }

        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        console.error('Login failed:', err);
        alert('Invalid email or password.');
        this.isSubmitting = false;
      }
    });
  }


  forgotPassword() {
    console.log('Forgot password clicked');
  }

  register() {

    this.router.navigate(['/register']);
    console.log('Register clicked');
  }

  goHome(){
    this.router.navigate(['/']);
  }
}






