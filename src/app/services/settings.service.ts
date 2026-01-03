import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export type TempUnit = 'c' | 'f';

export interface AppSettings {
  tempUnit: TempUnit;        // c / f
  autoRefresh: boolean;      // auto refresh on enter
  useSystemTheme: boolean;   // theme follows system
}

const KEY_SETTINGS = 'appSettings';

const DEFAULTS: AppSettings = {
  tempUnit: 'c',
  autoRefresh: true,
  useSystemTheme: true,
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private storage: StorageService) {}

  async getSettings(): Promise<AppSettings> {
    return this.storage.get<AppSettings>(KEY_SETTINGS, DEFAULTS);
  }

  async setSettings(next: AppSettings): Promise<void> {
    await this.storage.set(KEY_SETTINGS, next);
  }

  async patchSettings(patch: Partial<AppSettings>): Promise<void> {
    const current = await this.getSettings();
    await this.setSettings({ ...current, ...patch });
  }

  async reset(): Promise<void> {
    await this.setSettings(DEFAULTS);
  }
}