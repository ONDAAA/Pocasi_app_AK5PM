import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

const KEY_CITIES = 'cities';
const KEY_ACTIVE = 'activeCity';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  constructor(private storage: StorageService) {}

  async getCities(): Promise<string[]> {
    return this.storage.get<string[]>(KEY_CITIES, ['Ostrava']); // default
  }

  async addCity(city: string): Promise<void> {
    const c = city.trim();
    if (!c) return;

    const cities = await this.getCities();
    const exists = cities.some(x => x.toLowerCase() === c.toLowerCase());
    if (!exists) cities.unshift(c);

    await this.storage.set(KEY_CITIES, cities);

    const active = await this.getActiveCity();
    if (!active) await this.setActiveCity(c);
  }

  async removeCity(city: string): Promise<void> {
    const cities = await this.getCities();
    const filtered = cities.filter(x => x.toLowerCase() !== city.toLowerCase());
    await this.storage.set(KEY_CITIES, filtered);

    const active = await this.getActiveCity();
    if (active && active.toLowerCase() === city.toLowerCase()) {
      await this.setActiveCity(filtered[0] ?? '');
    }
  }

  async getActiveCity(): Promise<string> {
    return this.storage.get<string>(KEY_ACTIVE, '');
  }

  async setActiveCity(city: string): Promise<void> {
    await this.storage.set(KEY_ACTIVE, city);
  }
}