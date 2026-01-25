import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { FavoritesService } from '../services/favorites.service';
import { WeatherService } from '../services/weather.service';
import { SettingsService } from '../services/settings.service';

import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
} from '@ionic/angular/standalone';


type TempUnit = 'c' | 'f';

type CityRow = {
  name: string;
  localTime: string;
  tag: string;        // "Active" / "Saved"
  temp: number;       // podle jednotek (C/F)
  high: number;       // fallback (bez forecast)
  low: number;        // fallback
  condition: string;
  warning?: boolean;
};

type CitySuggest = {
  name: string;
  region?: string;
  country?: string;
};

@Component({
  selector: 'app-tab2',
  standalone: true,
  imports: [ CommonModule, IonHeader, IonToolbar, IonButtons, IonButton, IonSearchbar, IonList, IonItem, IonLabel, IonSpinner, IonContent, IonRefresher, IonRefresherContent, IonItemSliding, IonItemOptions, IonItemOption, IonIcon],
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  query = '';
  items: CityRow[] = [];
  unit: TempUnit = 'c';

  // našeptávač
  suggestions: CitySuggest[] = [];
  searching = false;

  private activeCity = '';
  private debounceTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private router: Router,
    private fav: FavoritesService,
    private weather: WeatherService,
    private settings: SettingsService
  ) {}

  async ionViewWillEnter() {
    // SettingsService u tebe nemá getSettings(), má snapshot/state$
    // => použij snapshot (už je to initnuté uvnitř service)
    const s = this.settings.snapshot;
    this.unit = s.tempUnit ?? 'c';

    // active city (pokud existuje)
    if (typeof (this.fav as any).getActiveCity === 'function') {
      this.activeCity = await (this.fav as any).getActiveCity();
    }

    await this.refresh();
  }

  // ---------- UI handlers ----------
  onSearchChange(ev: any) {
    this.query = (ev?.detail?.value ?? '').toString();

    // našeptávač (debounce)
    this.scheduleSuggestions();
  }

  clearSearch() {
    this.query = '';
    this.suggestions = [];
    this.searching = false;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  // pokud máš v HTML klik na suggestion, zavolej tohle
  pickSuggestion(name: string) {
    this.query = name;
    this.suggestions = [];
    this.searching = false;
  }

  async addCityFromQuery() {
  const input = this.normalizeCityInput(this.query);
  if (!input) return;

  // 1) Ověř existenci města přes API (když nenajde -> error)
  try {
    const data: any = await firstValueFrom(this.weather.getCurrentWeather(input));

    // 2) Vezmi kanonický název z API (lepší než ruční title case)
    const canonical =
      this.normalizeCityInput(data?.location?.name) || this.toTitleCase(input);

    // 3) Nepřidávat duplicity (case-insensitive)
    const existing = await this.safeListCities();
    const already = existing.some((x) => this.equalsCity(x, canonical));
    if (already) {
      this.query = '';
      return;
    }

    await this.fav.addCity(canonical);

    this.query = '';
    await this.refresh();
  } catch (e) {
    // Město nenalezeno / API error => nepřidávat
    alert('Město se nepodařilo najít. Zkus jiný název.');
  }
}

// -------- helpers (přidej do class) --------

private normalizeCityInput(v: string): string {
  return (v ?? '')
    .toString()
    .trim()
    .replace(/\s+/g, ' ');
}

private toTitleCase(v: string): string {
  // např. "ostrava" -> "Ostrava", "new york" -> "New York"
  return this.normalizeCityInput(v)
    .split(' ')
    .map((w) => (w ? w[0].toLocaleUpperCase('cs-CZ') + w.slice(1).toLocaleLowerCase('cs-CZ') : ''))
    .join(' ');
}

private equalsCity(a: string, b: string): boolean {
  return (
    this.normalizeCityInput(a).toLocaleLowerCase('cs-CZ') ===
    this.normalizeCityInput(b).toLocaleLowerCase('cs-CZ')
  );
}

  async doRefresh(ev: CustomEvent) {
    await this.refresh();
    // @ts-ignore
    ev?.detail?.complete?.();
  }

  async refresh() {
    const cities = await this.safeListCities();

    // pokud activeCity prázdné a máme města, nastav default
    if (!this.activeCity && cities.length) {
      this.activeCity = cities[0];
      if (typeof (this.fav as any).setActiveCity === 'function') {
        await (this.fav as any).setActiveCity(this.activeCity);
      }
    }

    const rows: CityRow[] = [];

    for (const city of cities) {
      try {
        const data: any = await firstValueFrom(this.weather.getCurrentWeather(city));

        const localTime = this.extractLocalTime(data);
        const condition = data?.current?.condition?.text ?? '—';
        const tempC = Number(data?.current?.temp_c ?? NaN);
        const feelsC = Number(data?.current?.feelslike_c ?? NaN);

        const temp = this.toUnit(tempC);
        const high = this.toUnit(isFinite(feelsC) ? feelsC : tempC + 1); // fallback
        const low = this.toUnit(isFinite(tempC) ? tempC - 2 : tempC);    // fallback

        rows.push({
          name: city,
          localTime,
          tag: city === this.activeCity ? 'Active' : 'Saved',
          temp: isFinite(temp) ? temp : 0,
          high: isFinite(high) ? high : 0,
          low: isFinite(low) ? low : 0,
          condition,
          warning: false,
        });
      } catch {
        rows.push({
          name: city,
          localTime: '—',
          tag: city === this.activeCity ? 'Active' : 'Saved',
          temp: 0,
          high: 0,
          low: 0,
          condition: 'Nepodařilo se načíst',
          warning: true,
        });
      }
    }

    // active city dej nahoru
    rows.sort((a, b) =>
      a.name === this.activeCity ? -1 : b.name === this.activeCity ? 1 : 0
    );

    this.items = rows;
  }

  openCity(c: CityRow) {
    this.setActive(c.name).then(() => {
      this.router.navigateByUrl('/tabs/tab1');
    });
  }

  trackByCity = (_: number, c: CityRow) => c.name;

  async setActive(name: string) {
    this.activeCity = name;

    if (typeof (this.fav as any).setActiveCity === 'function') {
      await (this.fav as any).setActiveCity(name);
    }

    await this.refresh();
  }

  async remove(name: string) {
    await this.fav.removeCity(name);

    // když smažeš active, přepni active na první zbylé
    if (name === this.activeCity) {
      const cities = await this.safeListCities();
      this.activeCity = cities[0] ?? '';
      if (this.activeCity && typeof (this.fav as any).setActiveCity === 'function') {
        await (this.fav as any).setActiveCity(this.activeCity);
      }
    }

    await this.refresh();
  }

  // ---------- AUTOCOMPLETE (WeatherAPI search.json) ----------
  private scheduleSuggestions() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    const q = this.query.trim();
    if (q.length < 2) {
      this.suggestions = [];
      this.searching = false;
      return;
    }

    this.searching = true;

    this.debounceTimer = setTimeout(() => {
      this.fetchSuggestions(q);
    }, 300);
  }

  private fetchSuggestions(q: string) {
    this.weather.searchCities(q).subscribe({
      next: (res: any[]) => {
        this.suggestions = (res ?? []).slice(0, 8).map((x) => ({
          name: x?.name,
          region: x?.region,
          country: x?.country,
        }));
        this.searching = false;
      },
      error: (e) => {
        console.error('[Tab2] searchCities error', e);
        this.suggestions = [];
        this.searching = false;
      },
    });
  }

  // ---------- helpers ----------
  private async safeListCities(): Promise<string[]> {
    if (typeof (this.fav as any).listCities === 'function') {
      return await (this.fav as any).listCities();
    }
    if (typeof (this.fav as any).getCities === 'function') {
      return await (this.fav as any).getCities();
    }
    return [];
  }

  private extractLocalTime(data: any): string {
    const raw = data?.location?.localtime;
    if (!raw || typeof raw !== 'string') return '—';
    const parts = raw.split(' ');
    return parts[1] ?? raw;
  }

  private toUnit(tempC: number): number {
    if (!isFinite(tempC)) return 0;
    if (this.unit === 'c') return Math.round(tempC);
    return Math.round((tempC * 9) / 5 + 32);
  }

  onSlidingDrag(ev: any) {

}

}