import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  async setJson<T>(key: string, value: T): Promise<void> {
    await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  }

  async getJson<T>(key: string, fallback: T): Promise<T> {
    const { value } = await Preferences.get({ key });
    if (!value) return fallback;

    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }
}
