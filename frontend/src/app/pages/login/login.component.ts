import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="flex min-h-[65vh] items-center justify-center py-8">
      <div class="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-7 shadow-2xl shadow-indigo-950/30 sm:p-10">
        <div class="mb-8">
          <span class="mb-4 inline-flex rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">
            Mirë se u ktheve
          </span>
          <h1 class="text-3xl font-bold tracking-tight text-white">Kyçu në llogari</h1>
          <p class="mt-2 text-sm leading-6 text-slate-400">Hyr për të vazhduar te eventet dhe biletat e tua.</p>
        </div>

        @if (error()) {
          <div role="alert" class="mb-5 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label for="login-email" class="mb-2 block text-sm font-medium text-slate-300">Email</label>
            <input id="login-email" type="email" [(ngModel)]="email" name="email" autocomplete="email" required
              class="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10" />
          </div>

          <div>
            <label for="login-password" class="mb-2 block text-sm font-medium text-slate-300">Fjalëkalimi</label>
            <input id="login-password" type="password" [(ngModel)]="password" name="password" autocomplete="current-password" required
              class="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10" />
          </div>

          <button type="submit" [disabled]="loading()"
            class="w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">
            {{ loading() ? 'Duke u kyçur...' : 'Kyçu' }}
          </button>
        </form>

        <p class="mt-7 text-center text-sm text-slate-400">
          Nuk ke llogari?
          <a routerLink="/register" class="font-semibold text-indigo-300 transition hover:text-indigo-200">Regjistrohu këtu</a>
        </p>
      </div>
    </section>
  `
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
