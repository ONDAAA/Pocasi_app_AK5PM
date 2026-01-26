import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })

// Služba pro práci s lokálním úložištěm pomocí Capacitor
export class StorageService {
  async get<T>(key: string, fallback: T): Promise<T> {

    const { value } = await Preferences.get({ key });

    if (!value) return fallback;

    try {
      return JSON.parse(value) as T; // Pokus o parsování uložené hodnoty
    } catch {
      return fallback; // V případě chyby vrátit výchozí hodnotu
    }
  }

  // Uložení hodnoty do lokálního úložiště
  async set<T>(key: string, value: T): Promise<void> {
    await Preferences.set({ key, value: JSON.stringify(value) });
  }

  // Odstranění hodnoty z lokálního úložiště
  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  // Vymazání celého lokálního úložiště
  async clear(): Promise<void> {
    await Preferences.clear();
  }
}