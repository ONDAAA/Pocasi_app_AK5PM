import { Injectable } from '@angular/core';
import { Auth, authState, User, signOut } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  constructor(private auth: Auth) {}

  async getCurrentUser(): Promise<User | null> {
    return await firstValueFrom(authState(this.auth));
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}