import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, firstValueFrom } from 'rxjs';

import { FavoritesService } from '../services/favorites.service';
import { WeatherService } from '../services/weather.service';
import { SettingsService, TempUnit } from '../services/settings.service';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  IonSkeletonText,
  IonCard,
  IonCardContent,
  IonChip,
  IonLabel,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab1',
  standalone: true,
  imports: [CommonModule, IonContent, IonRefresher, IonRefresherContent, IonIcon, IonSkeletonText, IonCard, IonCardContent, IonChip, IonLabel],
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
// Hlavní stránka - zobrazení počasí pro vybrané město
export class Tab1Page implements OnInit, OnDestroy {
  cities: string[] = [];
  activeCity = '';
  weather: any = null;
  loading = false;
  errorMessage = '';

  // Data pro předpověď počasí
  forecastDays: Array<{
    date: string;
    dayName: string;
    iconUrl: string;
    text: string;
    max: number;
    min: number;
  }> = [];

  // Jednotka teploty podle nastavení - výchozí 'c'
  unit: TempUnit = 'c';

  private subSettings?: Subscription;

  // Konstruktor s injektovanými službami
  constructor(
    private fav: FavoritesService,
    private weatherService: WeatherService,
    private settingsService: SettingsService
  ) {}

  // Inicializace komponenty
  async ngOnInit() {
    this.subSettings = this.settingsService.state$.subscribe((s) => {
      this.unit = s.tempUnit;

    });

    // Načíst seznam měst a aktuální počasí
    await this.loadCities();
  }

  ngOnDestroy() {
    this.subSettings?.unsubscribe();
  }

  async ionViewWillEnter() {
    await this.loadCities();
  }

  // Převod teploty z C na zvolenou jednotku
  displayTempCtoUnit(tempC: number | null | undefined): number {
    if (tempC === null || tempC === undefined) return 0;
    const c = Number(tempC);
    if (Number.isNaN(c)) return 0;
    return this.unit === 'c' ? Math.round(c) : Math.round((c * 9) / 5 + 32);
  }

  // Načíst seznam oblíbených měst a aktivní město
  async loadCities() {
    this.cities = await this.fav.getCities();
    const stored = await this.fav.getActiveCity();

    this.activeCity = stored || this.cities[0] || '';

    // Načíst počasí pro aktivní město
    if (this.activeCity) {
      await this.loadWeather();
    } else {
      this.weather = null;
      this.forecastDays = [];
      this.errorMessage = '';
    }
  }

  // Změna aktivního města
  async onCityChange(city: string) {
    this.activeCity = city;
    await this.fav.setActiveCity(city);
    await this.loadWeather();
  }

  bump = false;

  // Načíst aktuální počasí a předpověď pro aktivní město
  async loadWeather() {
    const city = (this.activeCity ?? '').trim();
    if (!city) return;

    this.loading = true;
    this.errorMessage = '';
    this.weather = null;
    this.forecastDays = [];

    // Načíst data z WeatherService
    try {
      
      // souběžné načtení aktuálního počasí i předpovědi
      const [w, f]: any[] = await Promise.all([
        firstValueFrom(this.weatherService.getCurrentWeather(city)),
        firstValueFrom(this.weatherService.getForecast(city, 7)),
      ]);

      this.weather = w;

      // zpracování dat pro předpověď
      const days = f?.forecast?.forecastday ?? [];
      this.forecastDays = days.map((d: any) => {
        const dateStr = String(d?.date ?? '');
        const dt = new Date(dateStr + 'T00:00:00');
        const dayNames = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
        const dayName = dayNames[dt.getDay()] ?? '';

        // ikona a text podmínky
        const icon = d?.day?.condition?.icon ? `https:${d.day.condition.icon}` : '';
        const text = translateConditionToCz(d?.day?.condition?.text) || '—';

        // maximální a minimální teplota
        const maxC = Number(d?.day?.maxtemp_c);
        const minC = Number(d?.day?.mintemp_c);

        // vrátit zpracovaný den předpovědi
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

  // Formátovat datum dne předpovědi
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

// Překlad podmínek počasí do češtiny
const CONDITION_CZ: Record<string, string> = {
  'Sunny': 'Slunečno',
  'Clear': 'Jasno',
  'Partly cloudy': 'Polojasno',
  'Cloudy': 'Zataženo',
  'Overcast': 'Zataženo',
  'Mist': 'Mlhavo',
  'Fog': 'Mlha',
  'Freezing fog': 'Mrznoucí mlha',

  'Patchy rain possible': 'Místy déšť',
  'Patchy light rain': 'Místy slabý déšť',
  'Light rain': 'Slabý déšť',
  'Moderate rain': 'Déšť',
  'Heavy rain': 'Silný déšť',
  'Light rain shower': 'Přeháňky',
  'Moderate or heavy rain shower': 'Silné přeháňky',

  'Patchy snow possible': 'Místy sníh',
  'Patchy light snow': 'Místy slabé sněžení',
  'Light snow': 'Slabé sněžení',
  'Moderate snow': 'Sněžení',
  'Heavy snow': 'Silné sněžení',
  'Blizzard': 'Vánice',

  'Thundery outbreaks possible': 'Možné bouřky',
  'Patchy light rain with thunder': 'Bouřky s deštěm',
  'Moderate or heavy rain with thunder': 'Silné bouřky s deštěm',

  'Sleet': 'Déšť se sněhem',
  'Light sleet': 'Slabý déšť se sněhem',
  'Moderate or heavy sleet': 'Déšť se sněhem',
  'Ice pellets': 'Ledové krupky',
  'Hail': 'Kroupy',
};

// Funkce pro překlad podmínky počasí do češtiny
function translateConditionToCz(text?: string | null): string {
  const t = (text ?? '').trim();
  return CONDITION_CZ[t] ?? t;
}

