import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { StorageService } from './storage.service';
import { CloudService } from './cloud.service';

export type TempUnit = 'c' | 'f';

export interface AppSettings {
  tempUnit: TempUnit;
  autoRefresh: boolean;
  useSystemTheme: boolean;
}

const KEY_SETTINGS = 'app_settings';

const DEFAULTS: AppSettings = {
  tempUnit: 'c',
  autoRefresh: true,
  useSystemTheme: true,
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private settings$ = new BehaviorSubject<AppSettings>(DEFAULTS);

  // vystavíš jako readonly observable
  readonly state$ = this.settings$.asObservable();

  // a jednoduchý getter
  get snapshot(): AppSettings {
    return this.settings$.value;
  }

  constructor(
    private auth: Auth,
    private storage: StorageService,
    private cloud: CloudService
  ) {
    // init + react na login/logout
    onAuthStateChanged(this.auth, async (u) => {
      await this.load(u ? 'cloud' : 'local');
    });

    // fallback init (kdyby auth event přišel pozdě)
    this.load('local');
  }

  private async load(source: 'local' | 'cloud') {
    try {
      if (source === 'cloud' && this.auth.currentUser) {
        const cloudSettings = await this.cloud.getSettings();
        if (cloudSettings) {
          this.settings$.next(cloudSettings);
          return;
        }
        // když v cloudu nic není, vezmi local a ulož do cloudu
        const local = await this.storage.get<AppSettings>(KEY_SETTINGS, DEFAULTS);
        this.settings$.next(local);
        await this.cloud.setSettings(local);
        return;
      }

      // LOCAL
      const local = await this.storage.get<AppSettings>(KEY_SETTINGS, DEFAULTS);
      this.settings$.next(local);
    } catch {
      // kdyby cokoliv, nesmí to shodit appku
      this.settings$.next(DEFAULTS);
    }
  }

  private async persist(next: AppSettings) {
    this.settings$.next(next);

    // vždy uložit lokálně (i pro user, je to rychlý fallback)
    await this.storage.set(KEY_SETTINGS, next);

    // pokud je user, uložit i do Firestore
    if (this.auth.currentUser) {
      await this.cloud.setSettings(next);
    }
  }

  async setTempUnit(unit: TempUnit) {
    await this.persist({ ...this.snapshot, tempUnit: unit });
  }

  async setAutoRefresh(v: boolean) {
    await this.persist({ ...this.snapshot, autoRefresh: v });
  }

  async setUseSystemTheme(v: boolean) {
    await this.persist({ ...this.snapshot, useSystemTheme: v });
  }

  async reset() {
    await this.persist(DEFAULTS);
  }
}