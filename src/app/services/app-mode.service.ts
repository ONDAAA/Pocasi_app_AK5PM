import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

// Definice typu režimu aplikace - host (guest), uživatel (user) nebo null (nenastaveno)
export type AppMode = 'guest' | 'user' | null;

@Injectable({ providedIn: 'root' })
// Služba pro správu režimu aplikace (host nebo uživatel)
export class AppModeService {
  private key = 'app.mode.v1';

  // Získat aktuální režim aplikace
  async getMode(): Promise<AppMode> {
    const { value } = await Preferences.get({ key: this.key }); // Načtení hodnoty z lokálního úložiště
    if (value === 'guest' || value === 'user') return value; // Ověření platnosti hodnoty - uživatel nebo host
    return null;
  }

  // Nastavit režim aplikace
  async setMode(mode: Exclude<AppMode, null>) {
    await Preferences.set({ key: this.key, value: mode });
  }

  // Vymazat režim aplikace
  async clearMode() {
    await Preferences.remove({ key: this.key });
  }
}
