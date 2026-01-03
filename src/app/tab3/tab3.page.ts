import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, SegmentChangeEventDetail } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { StorageService } from '../services/storage.service';
import { FavoritesService } from '../services/favorites.service';
import { AuthService } from '../services/auth.service';

type TempUnit = 'c' | 'f';

interface AppSettings {
  tempUnit: TempUnit;
  autoRefresh: boolean;
  useSystemTheme: boolean;
}

const SETTINGS_KEY = 'app_settings';

@Component({
  selector: 'app-tab3',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page implements OnInit, OnDestroy {
  loading = true;

  // auth state
  isLoggedIn = false;
  userEmail = '';

  // settings (initialized => žádné ?. v html, žádné NG8107 řeči)
  settings: AppSettings = {
    tempUnit: 'c',
    autoRefresh: true,
    useSystemTheme: true,
  };

  private sub?: Subscription;

  constructor(
    private router: Router,
    private storage: StorageService,
    private favorites: FavoritesService,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    // 1) load settings
    await this.loadSettings();

    // 2) auth state
    // AuthService by měl mít user$ (Observable<User|null>) – pokud máš jinak, napiš a upravím.
    this.sub = this.auth.user$?.subscribe((u: any) => {
      this.isLoggedIn = !!u;
      this.userEmail = u?.email ?? '';
    });

    this.loading = false;
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  // ---------- navigation ----------
  goLogin() {
    this.router.navigateByUrl('/login');
  }

  goRegister() {
    this.router.navigateByUrl('/register');
  }

  // ---------- settings ----------
  onTempUnitChange(ev: CustomEvent<SegmentChangeEventDetail>) {
    const v = ev.detail.value;
    if (v === 'c' || v === 'f') {
      this.setTempUnit(v);
    }
  }

  async setTempUnit(unit: TempUnit) {
    this.settings.tempUnit = unit;
    await this.saveSettings();
  }

  async toggleAutoRefresh(checked: boolean) {
    this.settings.autoRefresh = !!checked;
    await this.saveSettings();
  }

  async toggleUseSystemTheme(checked: boolean) {
    this.settings.useSystemTheme = !!checked;
    await this.saveSettings();
  }

  // ---------- account ----------
  async logout() {
    try {
      await this.auth.logout();
      // po logoutu klidně zůstaň na settings, nebo přesměruj:
      // await this.router.navigateByUrl('/auth-gate');
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
      // smaž nastavení
      await this.storage.remove(SETTINGS_KEY);

      // smaž oblíbené (pokud FavoritesService používá storage, ideálně má metodu clear)
      if (typeof (this.favorites as any).clear === 'function') {
        await (this.favorites as any).clear();
      } else {
        // fallback: pokud máš ve FavoritesService klíč, přepiš si to na ten svůj
        await this.storage.remove('favorite_cities');
      }

      // reload
      this.settings = {
        tempUnit: 'c',
        autoRefresh: true,
        useSystemTheme: true,
      };
      await this.saveSettings();

      alert('Hotovo. Lokální data resetována.');
    } catch (e) {
      console.error(e);
      alert('Reset selhal.');
    }
  }

  // ---------- storage helpers ----------
  private async loadSettings() {
    try {
      const raw = await this.storage.get<string | null>(SETTINGS_KEY, null);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<AppSettings>;

      // validace + fallbacky
      const tempUnit: TempUnit =
        parsed.tempUnit === 'f' ? 'f' : 'c';

      this.settings = {
        tempUnit,
        autoRefresh: parsed.autoRefresh ?? true,
        useSystemTheme: parsed.useSystemTheme ?? true,
      };
    } catch (e) {
      console.warn('[Tab3] loadSettings failed, using defaults', e);
    }
  }

  private async saveSettings() {
    await this.storage.set(SETTINGS_KEY, JSON.stringify(this.settings));
  }
}
