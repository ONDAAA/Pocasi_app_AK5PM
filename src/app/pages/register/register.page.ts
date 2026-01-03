import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppModeService } from '../../services/app-mode.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
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
    if (this.password !== this.password2) {
      this.error = 'Hesla se neshodují.';
      return;
    }

    this.loading = true;
    try {
      await this.auth.register(this.email.trim(), this.password);
      await this.appMode.setMode('user');
      await this.router.navigateByUrl('/tabs', { replaceUrl: true });
    } catch (e: any) {
      this.error = e?.message ?? 'Chyba registrace';
    } finally {
      this.loading = false;
    }
  }
}
