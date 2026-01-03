import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage {
  city = '';
  weather: any;
  loading = false;
  errorMessage = '';

  constructor(private weatherService: WeatherService) {}

  searchWeather() {
    if (!this.city?.trim()) return;

    this.loading = true;
    this.errorMessage = '';
    this.weather = null;

    this.weatherService.getCurrentWeather(this.city.trim()).subscribe({
      next: (data) => {
        this.weather = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Město nenalezeno nebo chyba API.';
        this.loading = false;
      },
    });
  }
}
