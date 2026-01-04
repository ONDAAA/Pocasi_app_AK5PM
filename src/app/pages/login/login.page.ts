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

  async doLogin() {
    this.error = '';
    this.loading = true;
    try {
      await this.auth.login(this.email.trim(), this.password);
      await this.appMode.setMode('user');
      await this.router.navigateByUrl('/tabs', { replaceUrl: true });
    } catch (e: any) {
      this.error = e?.message ?? 'Chyba přihlášení';
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
    this.loading = true;
    try {
      await this.auth.resetPassword(email);
      alert('Odesláno – zkontroluj email.');
    } catch (e: any) {
      this.error = e?.message ?? 'Chyba při odeslání emailu';
    } finally {
      this.loading = false;
    }
  }
}
