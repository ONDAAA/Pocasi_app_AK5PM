import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppModeService } from '../../services/app-mode.service';
import {
  IonContent,
  IonIcon,
  IonCard,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonSpinner,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

    // Ionic standalone components used in template:
    IonContent,
    IonIcon,
    IonCard,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton,
    IonSpinner,
  ],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  email = '';
  password = '';
  password2 = '';
  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private appMode: AppModeService,
    private router: Router
  ) {}

  async doRegister() {
    this.error = '';

    const email = this.email.trim();

    // ===== VALIDACE =====
    if (!email) {
      this.error = 'Zadej email.';
      return;
    }

    if (!this.isValidEmail(email)) {
      this.error = 'Email nemá správný formát.';
      return;
    }

    if (!this.password || this.password.length < 6) {
      this.error = 'Heslo musí mít alespoň 6 znaků.';
      return;
    }

    if (this.password !== this.password2) {
      this.error = 'Hesla se neshodují.';
      return;
    }

    // ===== REGISTER =====
    this.loading = true;
    try {
      await this.auth.register(email, this.password);
      await this.appMode.setMode('user');
      await this.router.navigateByUrl('/tabs', { replaceUrl: true });
    } catch (e: any) {
      this.error = this.mapFirebaseError(e);
    } finally {
      this.loading = false;
    }
  }

  // ===== HELPERS =====

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private mapFirebaseError(e: any): string {
    const code = e?.code ?? '';

    switch (code) {
      case 'auth/email-already-in-use':
        return 'Účet s tímto emailem už existuje.';
      case 'auth/invalid-email':
        return 'Email nemá správný formát.';
      case 'auth/weak-password':
        return 'Heslo je příliš slabé (min. 6 znaků).';
      case 'auth/network-request-failed':
        return 'Chyba připojení k síti.';
      default:
        return 'Registrace se nezdařila. Zkus to znovu.';
    }
  }
}