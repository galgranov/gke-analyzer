import { Route } from '@angular/router';
import { PodsComponent } from './pods/pods.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'pods', pathMatch: 'full' },
  { path: 'pods', component: PodsComponent },
];
