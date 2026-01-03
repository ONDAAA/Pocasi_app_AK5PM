import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private apiKey = '6b7a6a7ddd504cd59ee05555260301';
  private baseUrl = 'https://api.weatherapi.com/v1';

  constructor(private http: HttpClient) {}

  getCurrentWeather(city: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/current.json?key=${this.apiKey}&q=${city}&lang=cs`
    );
  }
}
