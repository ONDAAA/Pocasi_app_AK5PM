import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { FavoritesService } from '../services/favorites.service';
import { WeatherService } from '../services/weather.service';
import { SettingsService, TempUnit } from '../services/settings.service';

@Component({
  selector: 'app-tab1',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit, OnDestroy {
  cities: string[] = [];
  activeCity = '';
  weather: any = null;
  loading = false;
  errorMessage = '';

  unit: TempUnit = 'c';

  private subSettings?: Subscription;

  constructor(
    private fav: FavoritesService,
    private weatherService: WeatherService,
    private settingsService: SettingsService
  ) {}

  async ngOnInit() {
    // settings subscription (globální stav)
    this.subSettings = this.settingsService.state$.subscribe((s) => {
      this.unit = s.tempUnit;
      // není nutné reloadovat weather, jen se přepočítá display
      // (pokud bys chtěl, můžeš tu zavolat this.loadWeather(), ale není potřeba)
    });

    await this.loadCities();
  }

  ngOnDestroy() {
    this.subSettings?.unsubscribe();
  }

  async ionViewWillEnter() {
    // refresh cities + active city při návratu na tab
    await this.loadCities();
  }

  displayTempCtoUnit(tempC: number | null | undefined): number {
    if (tempC === null || tempC === undefined) return 0;
    const c = Number(tempC);
    if (Number.isNaN(c)) return 0;

    return this.unit === 'c' ? Math.round(c) : Math.round((c * 9) / 5 + 32);
  }

  async loadCities() {
    // podle toho co máš ve FavoritesService (listCities/getCities)
    // Ty používáš getCities() a getActiveCity() – nechávám to tak.
    this.cities = await this.fav.getCities();
    const stored = await this.fav.getActiveCity();

    this.activeCity = stored || this.cities[0] || '';

    if (this.activeCity) {
      await this.loadWeather();
    } else {
      // když nemáš žádná města, vyčisti UI
      this.weather = null;
      this.errorMessage = '';
    }
  }

  async onCityChange(city: string) {
    this.activeCity = city;
    await this.fav.setActiveCity(city);
    await this.loadWeather();
  }

  async loadWeather() {
    if (!this.activeCity) return;

    this.loading = true;
    this.errorMessage = '';
    this.weather = null;

    this.weatherService.getCurrentWeather(this.activeCity).subscribe({
      next: (data) => {
        this.weather = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Nepodařilo se načíst počasí.';
        this.loading = false;
      },
    });
  }
}