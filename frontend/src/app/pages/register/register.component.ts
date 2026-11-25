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
    <section class="flex min-h-[65vh] items-center justify-center py-8">
      <div class="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/80 p-7 shadow-2xl shadow-indigo-950/30 sm:p-10">
        <div class="mb-7">
          <span class="mb-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
            Fillo këtu
          </span>
          <h1 class="text-3xl font-bold tracking-tight text-white">Krijo llogari</h1>
          <p class="mt-2 text-sm leading-6 text-slate-400">Regjistrohu dhe bëhu gati për eventin tënd të radhës.</p>
        </div>

        @if (error()) {
          <div role="alert" class="mb-5 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="register-name" class="mb-2 block text-sm font-medium text-slate-300">Emri i plotë</label>
            <input id="register-name" type="text" [(ngModel)]="name" name="name" autocomplete="name" required
              class="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10" />
          </div>

          <div>
            <label for="register-email" class="mb-2 block text-sm font-medium text-slate-300">Email</label>
            <input id="register-email" type="email" [(ngModel)]="email" name="email" autocomplete="email" required
              class="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10" />
          </div>

          <div>
            <label for="register-password" class="mb-2 block text-sm font-medium text-slate-300">Fjalëkalimi (min. 6 karaktere)</label>
            <input id="register-password" type="password" [(ngModel)]="password" name="password" autocomplete="new-password" minlength="6" required
              class="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10" />
          </div>

          <div>
            <label for="register-role" class="mb-2 block text-sm font-medium text-slate-300">Roli</label>
            <select id="register-role" [(ngModel)]="role" name="role"
              class="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10">
              <option value="CLIENT">Klient (Blerës biletash)</option>
              <option value="ORGANIZER">Organizator (Krijon evente & skanon bileta)</option>
            </select>
          </div>

          <button type="submit" [disabled]="loading()"
            class="w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">
            {{ loading() ? 'Duke u regjistruar...' : 'Regjistrohu' }}
          </button>
        </form>

        <p class="mt-7 text-center text-sm text-slate-400">
          Ke tashmë llogari?
          <a routerLink="/login" class="font-semibold text-indigo-300 transition hover:text-indigo-200">Kyçu këtu</a>
        </p>
      </div>
    </section>
  `
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
