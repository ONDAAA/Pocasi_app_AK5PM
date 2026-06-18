import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private apiKey = environment.weatherApi.apiKey;
  private baseUrl = environment.weatherApi.baseUrl;

  //Volání HTTP klienta REST API
  constructor(private http: HttpClient) {}

  // Získání aktuálního počasí pro zadané město
  getCurrentWeather(city: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/current.json?key=${this.apiKey}&q=${city}&lang=cs`
    );
  }

  // Vyhledání měst podle dotazu
  searchCities(query: string) {
    const q = encodeURIComponent(query.trim());
    return this.http.get<any[]>(
      `${this.baseUrl}/search.json?key=${this.apiKey}&q=${q}&lang=cs`
    );
  }

  // Získání předpovědi počasí pro zadané město na určitý počet dní (výchozí 7)
  getForecast(city: string, days = 7) {
  const q = encodeURIComponent(city);
  return this.http.get(`${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${q}&days=${days}&aqi=no&alerts=no`);
}
}
