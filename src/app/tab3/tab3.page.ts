import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonContent,
  IonSpinner,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonItem,
  IonToggle,
} from '@ionic/angular/standalone';

import { FavoritesService } from '../services/favorites.service';
import { AuthService } from '../services/auth.service';
import { SettingsService, AppSettings, TempUnit } from '../services/settings.service';

@Component({
  selector: 'app-tab3',
  standalone: true,
  imports: [CommonModule, IonContent, IonSpinner, IonButton, IonSegment, IonSegmentButton, IonLabel, IonItem, IonToggle],
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})

// Stránka nastavení a správy účtu
export class Tab3Page implements OnInit, OnDestroy {
  loading = true;

  // Auth state
  isLoggedIn = false;
  userEmail = '';

  // Settings state
  settings: AppSettings = {
    tempUnit: 'c',

  };

  private subAuth?: Subscription;
  private subSettings?: Subscription;

  constructor(
    private router: Router,
    private favorites: FavoritesService,
    private auth: AuthService,
    private settingsSvc: SettingsService
  ) {}

  // Inicializace komponenty - načtení stavu autentizace a nastavení
  async ngOnInit() {
    this.subSettings = this.settingsSvc.state$.subscribe((s) => {
      this.settings = s;
    });

    // Sledování stavu přihlášení uživatele
    this.subAuth = this.auth.user$?.subscribe((u: any) => {
      this.isLoggedIn = !!u;
      this.userEmail = u?.email ?? '';
    });

    this.loading = false;
  }

  
  ngOnDestroy() {
    this.subAuth?.unsubscribe();
    this.subSettings?.unsubscribe();
  }

  // navigace na login stránku
  goLogin() {
    this.router.navigateByUrl('/login');
  }

  // navigace na registrační stránku
  goRegister() {
    this.router.navigateByUrl('/register');
  }

  //nastavení jednotky teploty
  async setTempUnit(unit: TempUnit) {
    await this.settingsSvc.setTempUnit(unit);
  }

  

  

  // údálost odhlášení
  async logout() {
    try {
      await this.auth.logout();
    } catch (e) {
      console.error(e);
      alert('Odhlášení selhalo.');
    }
  }

  // Reset lokálních dat (nastavení a oblíbená města)
  async resetLocalData() {
    const ok = confirm('Opravdu resetovat lokální data (města, nastavení)?');
    if (!ok) return;

    try {
      // reset nastavení
      await this.settingsSvc.reset();

      // smazat oblíbená města
      await this.favorites.clearLocal();

      alert('Hotovo. Lokální data resetována.');
    } catch (e) {
      console.error(e);
      alert('Reset selhal.');
    }
  }
}