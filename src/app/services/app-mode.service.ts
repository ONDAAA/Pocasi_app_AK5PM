import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export type AppMode = 'guest' | 'user' | null;

@Injectable({ providedIn: 'root' })
export class AppModeService {
  private key = 'app.mode.v1';

  async getMode(): Promise<AppMode> {
    const { value } = await Preferences.get({ key: this.key });
    if (value === 'guest' || value === 'user') return value;
    return null;
  }

  async setMode(mode: Exclude<AppMode, null>) {
    await Preferences.set({ key: this.key, value: mode });
  }

  async clearMode() {
    await Preferences.remove({ key: this.key });
  }
}
