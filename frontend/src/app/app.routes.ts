
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { EventListComponent } from './pages/event-list/event-list.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { MyTicketsComponent } from './pages/my-tickets/my-tickets.component';
import { CreateEventComponent } from './pages/create-event/create-event.component';
import { ValidateTicketComponent } from './pages/validate-ticket/validate-ticket.component';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'events', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'events', component: EventListComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'my-tickets', component: MyTicketsComponent, canActivate: [authGuard] },
  { path: 'organizer/create', component: CreateEventComponent, canActivate: [authGuard, roleGuard('ORGANIZER')] },
  { path: 'organizer/validate', component: ValidateTicketComponent, canActivate: [authGuard, roleGuard('ORGANIZER')] }
];
