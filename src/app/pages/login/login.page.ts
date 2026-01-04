import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppModeService } from '../../services/app-mode.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private appMode: AppModeService,
    private router: Router
  ) {}

  private isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  private niceAuthError(e: any): string {
    const code: string | undefined = e?.code;

    switch (code) {
      case 'auth/invalid-email':
      case 'auth/missing-email':
        return 'Email má špatný formát.';
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
      default:
        // Firebase někdy vrací jen message bez code, tak fallback:
        return e?.message ? String(e.message) : 'Chyba přihlášení.';
    }
  }

  async doLogin() {
    this.error = '';

    const email = this.email.trim();
    const pass = this.password;

    // rychlá validace (ať netrefuješ Firebase zbytečně)
    if (!email) {
      this.error = 'Zadej email.';
      return;
    }
    if (!this.isValidEmail(email)) {
      this.error = 'Email má špatný formát.';
      return;
    }
    if (!pass) {
      this.error = 'Zadej heslo.';
      return;
    }

    this.loading = true;
    try {
      await this.auth.login(email, pass);
      await this.appMode.setMode('user');
      await this.router.navigateByUrl('/tabs', { replaceUrl: true });
    } catch (e: any) {
      this.error = this.niceAuthError(e);
    } finally {
      this.loading = false;
    }
  }

  async forgotPassword() {
    this.error = '';

    const email = this.email.trim();
    if (!email) {
      this.error = 'Zadej email a pak klikni na Zapomenuté heslo.';
      return;
    }
    if (!this.isValidEmail(email)) {
      this.error = 'Email má špatný formát.';
      return;
    }

    this.loading = true;
    try {
      await this.auth.resetPassword(email);
      alert('Odesláno – zkontroluj email (i spam).');
    } catch (e: any) {
      this.error = this.niceAuthError(e);
    } finally {
      this.loading = false;
    }
  }
}