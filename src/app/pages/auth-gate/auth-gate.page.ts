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
  // Režim aplikace (guest / user); přesměrování mezi stránkami podle volby uživatele
  constructor(private appMode: AppModeService, private router: Router) {}

  // Pokračování bez přihlášení
  async continueAsGuest() {
    await this.appMode.setMode('guest'); // Aplikace v guest módu
    // Přesměrování do hlavní části aplikace
    // replaceUrl - brání návratu zpět na auth-gate
    await this.router.navigateByUrl('/tabs', { replaceUrl: true });
  }

  // Přesměrování na přihlašovací stránku
  async goLogin() {
    await this.router.navigateByUrl('/login');
  }

  // Přesměrování na registrační stránku
  async goRegister() {
    await this.router.navigateByUrl('/register');
  }
}
