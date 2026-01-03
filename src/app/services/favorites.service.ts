import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export type FavoriteCity = {
  name: string;
  country?: string;
  addedAt: number;
};

const FAVORITES_KEY = 'favorites.cities.v1';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  constructor(private storage: StorageService) {}

  async list(): Promise<FavoriteCity[]> {
    return this.storage.getJson<FavoriteCity[]>(FAVORITES_KEY, []);
  }

  async add(city: { name: string; country?: string }): Promise<void> {
    const favorites = await this.list();
    const exists = favorites.some(
      (c) => c.name.toLowerCase() === city.name.toLowerCase()
    );
    if (exists) return;

    favorites.unshift({
      name: city.name,
      country: city.country,
      addedAt: Date.now(),
    });

    await this.storage.setJson(FAVORITES_KEY, favorites);
  }

  async removeByName(name: string): Promise<void> {
    const favorites = await this.list();
    const filtered = favorites.filter(
      (c) => c.name.toLowerCase() !== name.toLowerCase()
    );
    await this.storage.setJson(FAVORITES_KEY, filtered);
  }

  async clear(): Promise<void> {
    await this.storage.remove(FAVORITES_KEY);
  }
}
