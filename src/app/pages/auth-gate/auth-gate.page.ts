import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AppModeService } from '../../services/app-mode.service';

@Component({
  selector: 'app-auth-gate',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './auth-gate.page.html',
  styleUrls: ['./auth-gate.page.scss'],
})
export class AuthGatePage {
  constructor(private appMode: AppModeService, private router: Router) {}

  async continueAsGuest() {
    await this.appMode.setMode('guest');
    await this.router.navigateByUrl('/tabs', { replaceUrl: true });
  }

  async goLogin() {
    console.log('test');
    alert('test');
    await this.router.navigateByUrl('/login');

  }

  async goRegister() {
    await this.router.navigateByUrl('/register');
  }
}
