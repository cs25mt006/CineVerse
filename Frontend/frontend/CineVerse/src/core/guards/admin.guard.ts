// src/app/guards/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    if (user && user.is_staff) {
      return true;
    }
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/admin/dashboard' } });
    return false;
  }
}
