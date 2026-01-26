import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { StorageService } from './storage.service';
import { CloudService } from './cloud.service';

const KEY_CITIES = 'favorite_cities';
const KEY_ACTIVE = 'active_city';

@Injectable({ providedIn: 'root' })
// Služba pro správu oblíbených měst
export class FavoritesService {
  constructor(
    private auth: Auth,
    private storage: StorageService,
    private cloud: CloudService
  ) {}

  // Zkontrolovat, zda je uživatel přihlášen
  private loggedIn() {
    return !!this.auth.currentUser;
  }

  // Načíst oblíbená města z lokálního úložiště
  private async localList(): Promise<string[]> {
    return await this.storage.get<string[]>(KEY_CITIES, []);
  }

  // Uložit oblíbená města do lokálního úložiště
  private async localSave(list: string[]) {
    await this.storage.set(KEY_CITIES, list);
  }

// Přidat oblíbené město
  async addCity(name: string) {
    const n = name.trim();
    if (!n) return;

    
    // Pokud je uživatel přihlášen, přidat město do cloudu
    if (this.loggedIn()) {
      await this.cloud.addFavoriteCity(n);
      const active = await this.getActiveCity();
      if (!active) await this.setActiveCity(n);
      return;
    }

    // Jinak přidat město do lokálního úložiště
    const list = await this.localList();
    if (!list.includes(n)) list.push(n);
    await this.localSave(list);

    // Nastavit aktivní město, pokud ještě není nastaveno
    const active = await this.getActiveCity();
    if (!active) await this.setActiveCity(n);
  }

  // Získat oblíbená města z cloudu nebo lokálního úložiště
  async getCities(): Promise<string[]> {
    if (this.loggedIn()) return this.cloud.listFavoriteCities();
    return this.localList();
  }

  // Vypsat oblíbená města
  async listCities(): Promise<string[]> {
    return this.getCities();
  }

  // Odebrat oblíbené město
  async removeCity(name: string) {
    const n = name.trim();
    if (!n) return;

    // Odebrat město z cloudu nebo lokálního úložiště podle stavu přihlášení
    if (this.loggedIn()) {
      await this.cloud.removeFavoriteCity(n);
    } else {
      const list = await this.localList();
      await this.localSave(list.filter((x) => x !== n));
    }
    // Pokud bylo odebrané město aktivní, nastavit první dostupné město jako aktivní
    const active = await this.getActiveCity();
    if (active === n) {
      const cities = await this.getCities();
      await this.setActiveCity(cities[0] ?? '');
    }
  }

  // Získat aktivní město
  async getActiveCity(): Promise<string> {
    return await this.storage.get<string>(KEY_ACTIVE, '');
  }

  // Nastavit aktivní město
  async setActiveCity(city: string) {
    await this.storage.set(KEY_ACTIVE, city ?? '');
  }

  // Vymazat lokální oblíbená města
  async clearLocal() {
    await this.storage.remove(KEY_CITIES);
    await this.storage.remove(KEY_ACTIVE);
  }

// Migrovat oblíbená města z lokálního úložiště do cloudu po přihlášení uživatele
  async migrateLocalToCloud() {
    if (!this.loggedIn()) return;
    // Načíst oblíbená města z lokálního úložiště
    const local = await this.storage.get<string[]>(KEY_CITIES, []);
    for (const c of local) {
      await this.cloud.addFavoriteCity(c);
    }
    await this.storage.remove(KEY_CITIES);
  }
}