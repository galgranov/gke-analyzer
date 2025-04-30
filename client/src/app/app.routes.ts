import { Route } from '@angular/router';
import { PodsComponent } from './pods/pods.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { LayoutComponent } from './components/layout/layout.component';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'pods', pathMatch: 'full' },
      { path: 'pods', component: PodsComponent, canActivate: [AuthGuard] },
      { 
        path: 'configuration', 
        loadComponent: () => import('./configuration/configuration.component').then(m => m.ConfigurationComponent),
        canActivate: [AuthGuard] 
      },
      { 
        path: 'cluster', 
        loadComponent: () => import('./cluster/cluster.component').then(m => m.ClusterComponent),
        canActivate: [AuthGuard] 
      },
      { 
        path: 'cloud', 
        loadComponent: () => import('./cloud/cloud.component').then(m => m.CloudComponent),
        canActivate: [AuthGuard] 
      },
    ]
  },
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
  { path: '**', redirectTo: '' }
];
