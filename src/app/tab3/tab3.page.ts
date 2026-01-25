import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
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
  imports: [IonicModule, CommonModule, IonContent, IonSpinner, IonButton, IonSegment, IonSegmentButton, IonLabel, IonItem, IonToggle],
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page implements OnInit, OnDestroy {
  loading = true;

  // auth state
  isLoggedIn = false;
  userEmail = '';

  // settings (bez ? v html)
  settings: AppSettings = {
    tempUnit: 'c',
    autoRefresh: true,
    useSystemTheme: true,
  };

  private subAuth?: Subscription;
  private subSettings?: Subscription;

  constructor(
    private router: Router,
    private favorites: FavoritesService,
    private auth: AuthService,
    private settingsSvc: SettingsService
  ) {}

  async ngOnInit() {
    // Settings state (globální + persistentní)
    this.subSettings = this.settingsSvc.state$.subscribe((s) => {
      this.settings = s;
    });

    // Auth state
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

  // ---------- navigation ----------
  goLogin() {
    this.router.navigateByUrl('/login');
  }

  goRegister() {
    this.router.navigateByUrl('/register');
  }

  // ---------- settings ----------
  async setTempUnit(unit: TempUnit) {
    await this.settingsSvc.setTempUnit(unit);
  }

  async toggleAutoRefresh(checked: boolean) {
    await this.settingsSvc.setAutoRefresh(!!checked);
  }

  async toggleUseSystemTheme(checked: boolean) {
    await this.settingsSvc.setUseSystemTheme(!!checked);
  }

  // ---------- account ----------
  async logout() {
    try {
      await this.auth.logout();
    } catch (e) {
      console.error(e);
      alert('Odhlášení selhalo.');
    }
  }

  // ---------- data management ----------
  async resetLocalData() {
    const ok = confirm('Opravdu resetovat lokální data (města, nastavení)?');
    if (!ok) return;

    try {
      // reset settings (tím se uloží i do local)
      await this.settingsSvc.reset();

      // smazat lokální favorites (guest data)
      await this.favorites.clearLocal();

      alert('Hotovo. Lokální data resetována.');
    } catch (e) {
      console.error(e);
      alert('Reset selhal.');
    }
  }
}