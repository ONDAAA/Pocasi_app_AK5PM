import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Subscription, firstValueFrom } from 'rxjs';

import { FavoritesService } from '../services/favorites.service';
import { WeatherService } from '../services/weather.service';
import { SettingsService, TempUnit } from '../services/settings.service';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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

  forecastDays: Array<{
    date: string;
    dayName: string;
    iconUrl: string;
    text: string;
    max: number;
    min: number;
  }> = [];

  unit: TempUnit = 'c';

  private subSettings?: Subscription;

  constructor(
    private fav: FavoritesService,
    private weatherService: WeatherService,
    private settingsService: SettingsService
  ) {}

  async ngOnInit() {
    this.subSettings = this.settingsService.state$.subscribe((s) => {
      this.unit = s.tempUnit;

    });

    await this.loadCities();
  }

  ngOnDestroy() {
    this.subSettings?.unsubscribe();
  }

  async ionViewWillEnter() {
    await this.loadCities();
  }

  displayTempCtoUnit(tempC: number | null | undefined): number {
    if (tempC === null || tempC === undefined) return 0;
    const c = Number(tempC);
    if (Number.isNaN(c)) return 0;
    return this.unit === 'c' ? Math.round(c) : Math.round((c * 9) / 5 + 32);
  }

  async loadCities() {
    this.cities = await this.fav.getCities();
    const stored = await this.fav.getActiveCity();

    this.activeCity = stored || this.cities[0] || '';

    if (this.activeCity) {
      await this.loadWeather();
    } else {
      this.weather = null;
      this.forecastDays = [];
      this.errorMessage = '';
    }
  }

  async onCityChange(city: string) {
    this.activeCity = city;
    await this.fav.setActiveCity(city);
    await this.loadWeather();
  }

  bump = false;

  async loadWeather() {
    const city = (this.activeCity ?? '').trim();
    if (!city) return;

    this.loading = true;
    this.errorMessage = '';
    this.weather = null;
    this.forecastDays = [];

    try {
      
      const [w, f]: any[] = await Promise.all([
        firstValueFrom(this.weatherService.getCurrentWeather(city)),
        firstValueFrom(this.weatherService.getForecast(city, 7)),
      ]);

      this.weather = w;

      const days = f?.forecast?.forecastday ?? [];
      this.forecastDays = days.map((d: any) => {
        const dateStr = String(d?.date ?? '');
        const dt = new Date(dateStr + 'T00:00:00');
        const dayNames = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
        const dayName = dayNames[dt.getDay()] ?? '';

        const icon = d?.day?.condition?.icon ? `https:${d.day.condition.icon}` : '';
        const text = d?.day?.condition?.text ?? '—';

        const maxC = Number(d?.day?.maxtemp_c);
        const minC = Number(d?.day?.mintemp_c);

        return {
          date: dateStr,
          dayName,
          iconUrl: icon,
          text,
          max: this.displayTempCtoUnit(maxC),
          min: this.displayTempCtoUnit(minC),
        };
      });
    } catch (e) {
      this.errorMessage = 'Nepodařilo se načíst počasí.';
      this.weather = null;
      this.forecastDays = [];
    } finally {
      this.loading = false;
    }
  }


  formatForecastDay(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    const days = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
    const day = days[d.getDay()] ?? '';
    return `${day} ${d.getDate()}.${d.getMonth() + 1}.`;
  }

  async refreshWithHaptics() {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
    this.bump = true;
    setTimeout(() => (this.bump = false), 250);
    await this.loadWeather();
  }

  async metricTap(label: string) {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}
    console.log('metric tap:', label);
  }

  async handlePullToRefresh(ev: CustomEvent) {
    await this.loadWeather();
    // @ts-ignore
    ev.target?.complete?.();
  }
}