import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  authState,
} from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth) {}
  readonly user$ = authState(this.auth);

  // ---------- PUBLIC API ----------
  async login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  async logout() {
    return signOut(this.auth);
  }

  // ---------- ERROR MAPPING ----------
  getNiceError(err: any): string {
    const code: string | undefined = err?.code;

    switch (code) {
      // common auth
      case 'auth/invalid-email':
        return 'Email má špatný formát.';
      case 'auth/missing-email':
        return 'Zadej email.';
      case 'auth/missing-password':
        return 'Zadej heslo.';
      case 'auth/user-not-found':
        return 'Účet s tímto emailem neexistuje.';
      case 'auth/wrong-password':
        return 'Špatné heslo.';
      case 'auth/invalid-credential':
        return 'Nesprávné přihlašovací údaje.';
      case 'auth/user-disabled':
        return 'Tento účet je deaktivovaný.';
      case 'auth/too-many-requests':
        return 'Příliš mnoho pokusů. Zkus to za chvíli.';
      case 'auth/network-request-failed':
        return 'Chyba sítě. Zkontroluj připojení k internetu.';

      // register-specific
      case 'auth/email-already-in-use':
        return 'Tento email už je zaregistrovaný.';
      case 'auth/operation-not-allowed':
        return 'Přihlášení emailem není povolené v nastavení projektu.';
      case 'auth/weak-password':
        return 'Heslo je moc slabé. Dej aspoň 6 znaků.';

      default:
        // fallback, když Firebase pošle něco nového
        return 'Něco se pokazilo. Zkus to prosím znovu.';
    }
  }
}