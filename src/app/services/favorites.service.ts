import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { StorageService } from './storage.service';
import { CloudService } from './cloud.service';

const KEY_CITIES = 'favorite_cities';
const KEY_ACTIVE = 'active_city';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  constructor(
    private auth: Auth,
    private storage: StorageService,
    private cloud: CloudService
  ) {}

  private loggedIn() {
    return !!this.auth.currentUser;
  }

  // ---------- LOCAL helpers ----------
  private async localList(): Promise<string[]> {
    return await this.storage.get<string[]>(KEY_CITIES, []);
  }

  private async localSave(list: string[]) {
    await this.storage.set(KEY_CITIES, list);
  }

  // ---------- PUBLIC API (DB/local auto) ----------

  // ADD (alias addCity)
  async addCity(name: string) {
    const n = name.trim();
    if (!n) return;

    

    if (this.loggedIn()) {
      await this.cloud.addFavoriteCity(n);
      // optional: pokud ještě nemáš active, nastav ho
      const active = await this.getActiveCity();
      if (!active) await this.setActiveCity(n);
      return;
    }

    const list = await this.localList();
    if (!list.includes(n)) list.push(n);
    await this.localSave(list);

    const active = await this.getActiveCity();
    if (!active) await this.setActiveCity(n);
  }

  // LIST (hlavní metoda pro stránky)
  async getCities(): Promise<string[]> {
    if (this.loggedIn()) return this.cloud.listFavoriteCities();
    return this.localList();
  }

  // zpětná kompatibilita, kdybys někde měl listCities()
  async listCities(): Promise<string[]> {
    return this.getCities();
  }

  // REMOVE
  async removeCity(name: string) {
    const n = name.trim();
    if (!n) return;

    if (this.loggedIn()) {
      await this.cloud.removeFavoriteCity(n);
    } else {
      const list = await this.localList();
      await this.localSave(list.filter((x) => x !== n));
    }

    // když smažu active, nastav další (nebo prázdno)
    const active = await this.getActiveCity();
    if (active === n) {
      const cities = await this.getCities();
      await this.setActiveCity(cities[0] ?? '');
    }
  }

  // ---------- ACTIVE CITY (zatím lokálně; stačí pro obhajobu) ----------
  async getActiveCity(): Promise<string> {
    return await this.storage.get<string>(KEY_ACTIVE, '');
  }

  async setActiveCity(city: string) {
    await this.storage.set(KEY_ACTIVE, city ?? '');
  }

  // ---------- MAINTENANCE ----------
  async clearLocal() {
    await this.storage.remove(KEY_CITIES);
    await this.storage.remove(KEY_ACTIVE);
  }

  // ---------- MIGRATION (lokál -> cloud po loginu) ----------
  async migrateLocalToCloud() {
    if (!this.loggedIn()) return;

    const local = await this.storage.get<string[]>(KEY_CITIES, []);
    for (const c of local) {
      await this.cloud.addFavoriteCity(c);
    }
    await this.storage.remove(KEY_CITIES);
  }
}