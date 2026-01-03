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

  constructor(private weatherService: WeatherService) {}

  searchWeather() {
    if (!this.city) return;

    this.weatherService.getCurrentWeather(this.city).subscribe({
      next: (data) => (this.weather = data),
      error: () => alert('Město nenalezeno'),
    });
  }
}
