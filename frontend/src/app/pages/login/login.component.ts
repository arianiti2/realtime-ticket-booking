import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-card">
      <h2>Kyçu në llogari</h2>
      @if (error()) {
        <div class="error-box">{{ error() }}</div>
      }
      <form (ngSubmit)="onSubmit()">
        <label>Email</label>
        <input type="email" [(ngModel)]="email" name="email" required />

        <label>Fjalëkalimi</label>
        <input type="password" [(ngModel)]="password" name="password" required />

        <button type="submit" [disabled]="loading()">
          {{ loading() ? 'Duke u kyçur...' : 'Kyçu' }}
        </button>
      </form>
      <p>Nuk ke llogari? <a routerLink="/register">Regjistrohu këtu</a></p>
    </div>
  `,
  styles: [`
    .auth-card { max-width: 400px; margin: 3rem auto; padding: 2rem; border: 1px solid #ddd; border-radius: 8px; }
    label { display: block; margin-top: 1rem; font-weight: 600; }
    input { width: 100%; padding: 0.6rem; margin-top: 0.3rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
    button { width: 100%; margin-top: 1.5rem; padding: 0.75rem; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; }
    button:disabled { opacity: 0.6; }
    .error-box { background: #fee2e2; color: #b91c1c; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/events']),
      error: (err) => {
        this.error.set(err.error?.message || 'Gabim gjatë kyçjes.');
        this.loading.set(false);
      }
    });
  }
}
