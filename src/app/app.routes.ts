import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/start/start.page').then((m) => m.StartPage),
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'auth-gate',
    loadComponent: () =>
      import('./pages/auth-gate/auth-gate.page').then((m) => m.AuthGatePage),
  },
  { path: '**', redirectTo: '' },
];
