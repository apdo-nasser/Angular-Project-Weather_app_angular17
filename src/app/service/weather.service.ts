import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = "c2f660820d8c405c89b61b5615b32269";
  private apiUrl = "https://api.openweathermap.org/data/2.5/weather";

  constructor(private http: HttpClient) { }

  getWeather(city: string): Observable<any> {
    const url = `${this.apiUrl}?q=${city}&units=metric&appid=${this.apiKey}`;
    return this.http.get(url);
  }
  getWeatherByCoordinates(lat: number, lon: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`);
  }
  getCityNameByCoordinates(lat: number, lon: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`);
  }
}
