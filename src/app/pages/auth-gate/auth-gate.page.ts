import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppModeService } from '../../services/app-mode.service';

@Component({
  selector: 'app-auth-gate',
  standalone: true,
  imports: [IonicModule, CommonModule],
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
    
  }

  async goRegister() {
    
  }
}
