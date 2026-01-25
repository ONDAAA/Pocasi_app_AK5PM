import { Routes } from '@angular/router';

export const routes: Routes = [
  // 🔑 Start page rozhoduje, kam jít (auth-gate / tabs)
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

  {
    path: 'search',
    loadComponent: () =>
      import('./pages/search/search.page').then((m) => m.SearchPage),
  },

  {
    path: 'detail',
    loadComponent: () =>
      import('./pages/detail/detail.page').then((m) => m.DetailPage),
  },

  {
    path: 'favorites',
    loadComponent: () =>
      import('./pages/favorites/favorites.page').then((m) => m.FavoritesPage),
  },

  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.page').then((m) => m.SettingsPage),
  },

  // 🔁 fallback → start (ne auth-gate!)
  { path: '**', redirectTo: '' },
];
