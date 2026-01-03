import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { FavoritesService } from '../services/favorites.service';
import { WeatherService } from '../services/weather.service';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-tab1',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  cities: string[] = [];
  activeCity = '';
  weather: any = null;
  loading = false;
  errorMessage = '';

  constructor(
    private fav: FavoritesService,
    private weatherService: WeatherService,
    private settingsService: SettingsService
  ) {}

  async ngOnInit() {
    await this.loadCities();
  }

  unit: 'c' | 'f' = 'c';

  async ionViewWillEnter() {
    const s = await this.settingsService.getSettings();
    this.unit = s.tempUnit;
    await this.loadCities();
  }

displayTempCtoUnit(tempC: number): number {
  return this.unit === 'c' ? tempC : Math.round((tempC * 9) / 5 + 32);
}

  async loadCities() {
    this.cities = await this.fav.getCities();
    const stored = await this.fav.getActiveCity();
    this.activeCity = stored || this.cities[0] || '';
    if (this.activeCity) await this.loadWeather();
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