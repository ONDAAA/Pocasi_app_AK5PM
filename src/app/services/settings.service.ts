import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { StorageService } from './storage.service';
import { CloudService } from './cloud.service';

// Typ pro jednotky teploty a nastavení aplikace
export type TempUnit = 'c' | 'f';

// Rozhraní pro nastavení aplikace
export interface AppSettings {
  tempUnit: TempUnit;

}

// Klíč pro uložení nastavení v lokálním úložišti
const KEY_SETTINGS = 'app_settings';

// Výchozí nastavení aplikace
const DEFAULTS: AppSettings = {
  tempUnit: 'c',

};

@Injectable({ providedIn: 'root' })
// Služba pro správu nastavení aplikace
export class SettingsService {
  private settings$ = new BehaviorSubject<AppSettings>(DEFAULTS);

  // Veřejné observable pro sledování změn nastavení
  readonly state$ = this.settings$.asObservable();

  // Okamžitý snímek aktuálního nastavení
  get snapshot(): AppSettings {
    return this.settings$.value;
  }

  // Konstruktor služby, inicializace a reakce na změny autentizace
  constructor(
    private auth: Auth,
    private storage: StorageService,
    private cloud: CloudService
  ) {
    // Sledovat změny autentizace uživatele
    onAuthStateChanged(this.auth, async (u) => {
      await this.load(u ? 'cloud' : 'local');
    });

    // Načíst počáteční nastavení
    this.load('local');
  }

  // Načíst nastavení z lokálního úložiště nebo cloudu
  private async load(source: 'local' | 'cloud') {
    try {
      // CLOUD
      if (source === 'cloud' && this.auth.currentUser) {
        const cloudSettings = await this.cloud.getSettings();
        if (cloudSettings) {
          this.settings$.next(cloudSettings);
          return;
        }
        // pokud cloud nastavení nejsou, migrovat z local
        const local = await this.storage.get<AppSettings>(KEY_SETTINGS, DEFAULTS);
        this.settings$.next(local);
        await this.cloud.setSettings(local);
        return;
      }

      // LOCAL
      const local = await this.storage.get<AppSettings>(KEY_SETTINGS, DEFAULTS);
      this.settings$.next(local);
    } catch {
      this.settings$.next(DEFAULTS);
    }
  }

  // Uložit nastavení do lokálního úložiště a cloudu
  private async persist(next: AppSettings) {
    this.settings$.next(next);

    // uložit do local
    await this.storage.set(KEY_SETTINGS, next);

    // uložit do cloud pokud je uživatel přihlášen
    if (this.auth.currentUser) {
      await this.cloud.setSettings(next);
    }
  }

  // Nastavit jednotku teploty
  async setTempUnit(unit: TempUnit) {
    await this.persist({ ...this.snapshot, tempUnit: unit });
  }

  

  
  // Obnovit výchozí nastavení
  async reset() {
    await this.persist(DEFAULTS);
  }

// Získat aktuální nastavení
async getSettings(): Promise<AppSettings> {
  return this.snapshot;
}

}