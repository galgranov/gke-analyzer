import { Route } from '@angular/router';
import { PodsComponent } from './pods/pods.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { LayoutComponent } from './components/layout/layout.component';
import { AuthGuard } from './guards/auth.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'pods', pathMatch: 'full' },
      { path: 'pods', component: PodsComponent, canActivate: [AuthGuard] },
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '' }
];
