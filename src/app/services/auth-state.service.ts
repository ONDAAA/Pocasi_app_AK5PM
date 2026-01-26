import { Injectable } from '@angular/core';
import { Auth, authState, User, signOut } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
// Služba pro správu stavu autentizace uživatele
export class AuthStateService {
  constructor(private auth: Auth) {}

  // Získat aktuálního přihlášeného uživatele
  async getCurrentUser(): Promise<User | null> {
    return await firstValueFrom(authState(this.auth));
  }

  // Odhlásit uživatele
  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}