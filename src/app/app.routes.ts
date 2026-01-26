import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/start/start.page').then((m) => m.StartPage),
  },

  {
    path: 'auth-gate',
    loadComponent: () =>
      import('./pages/auth-gate/auth-gate.page').then((m) => m.AuthGatePage),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.page').then((m) => m.RegisterPage),
  },

  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.routes').then((m) => m.routes),
  },

  { path: '**', redirectTo: '' },
];
