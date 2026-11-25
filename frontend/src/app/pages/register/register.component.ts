import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-card">
      <h2>Krijo llogari të re</h2>
      @if (error()) {
        <div class="error-box">{{ error() }}</div>
      }
      <form (ngSubmit)="onSubmit()">
        <label>Emri i plotë</label>
        <input type="text" [(ngModel)]="name" name="name" required />

        <label>Email</label>
        <input type="email" [(ngModel)]="email" name="email" required />

        <label>Fjalëkalimi (min. 6 karaktere)</label>
        <input type="password" [(ngModel)]="password" name="password" minlength="6" required />

        <label>Roli</label>
        <select [(ngModel)]="role" name="role">
          <option value="CLIENT">Klient (Blerës biletash)</option>
          <option value="ORGANIZER">Organizator (Krijon evente & skanon bileta)</option>
        </select>

        <button type="submit" [disabled]="loading()">
          {{ loading() ? 'Duke u regjistruar...' : 'Regjistrohu' }}
        </button>
      </form>
      <p>Ke tashmë llogari? <a routerLink="/login">Kyçu këtu</a></p>
    </div>
  `,
  styles: [`
    .auth-card { max-width: 400px; margin: 3rem auto; padding: 2rem; border: 1px solid #ddd; border-radius: 8px; }
    label { display: block; margin-top: 1rem; font-weight: 600; }
    input, select { width: 100%; padding: 0.6rem; margin-top: 0.3rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
    button { width: 100%; margin-top: 1.5rem; padding: 0.75rem; background: #16a34a; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; }
    button:disabled { opacity: 0.6; }
    .error-box { background: #fee2e2; color: #b91c1c; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; }
  `]
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  role: Role = 'CLIENT';
  loading = signal(false);
  error = signal('');

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.auth.register({ name: this.name, email: this.email, password: this.password, role: this.role }).subscribe({
      next: () => this.router.navigate(['/events']),
      error: (err) => {
        this.error.set(err.error?.message || 'Gabim gjatë regjistrimit.');
        this.loading.set(false);
      }
    });
  }
}
