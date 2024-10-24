import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WeatherService } from './service/weather.service';
import { Observable, of } from 'rxjs';
import { startWith, map, switchMap, debounceTime, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface OpenWeatherGeocodingResponse {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  searchForm!: FormGroup;
  weather: any;
  errorMessage: string | null = null;
  currentCityName: string | null = null;
  isDay: boolean = true;
  countryFlagUrl: string | null = null;
  countryName: string | null = null;
  filteredOptions!: Observable<string[]>;
  recentSearches: string[] = [];
  private cache: { [key: string]: string[] } = {};
  showPhotos: boolean = false; // Add this line

  // Use OpenWeather API key and Geocoding API URL
  private openWeatherApiKey: string = 'c2f660820d8c405c89b61b5615b32269';
  private openWeatherGeocodingUrl: string = 'http://api.openweathermap.org/geo/1.0/direct';

  constructor(private fb: FormBuilder, private service: WeatherService, private http: HttpClient) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      city: [null, Validators.required]
    });

    // Trigger the filter logic after 2 or 3 characters are entered
    this.filteredOptions = this.searchForm.get('city')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300), // Reducing the debounce time for faster response
      switchMap((value: string) => this._filter(value || ''))
    );

    this.loadRecentSearches();
  }

  private _filter(value: string): Observable<string[]> {
    // Only trigger the API call when 2 or more characters are entered
    if (value.length < 2) {
      return of([]); // Return empty array if less than 2 characters are entered
    }
  
    if (this.cache[value]) {
      return of(this.cache[value]); // Return cached results if available
    }
  
    // Call OpenWeather Geocoding API for city suggestions
    return this.http
      .get<OpenWeatherGeocodingResponse[]>(`${this.openWeatherGeocodingUrl}?q=${value}&limit=5&appid=${this.openWeatherApiKey}`)
      .pipe(
        map((response) => {
          // Show only city names, no country codes
          const options = response.map((result) => result.name);
          this.cache[value] = options;
          return options;
        }),
        catchError((error) => {
          this.errorMessage = 'Failed to fetch city names. Please try again later.';
          return of([]);
        })
      );
  }
  

  private loadRecentSearches() {
    const searches = localStorage.getItem('recentSearches');
    if (searches) {
      this.recentSearches = JSON.parse(searches);
    }
  }

  private saveRecentSearch(city: string) {
    if (!this.recentSearches.includes(city)) {
      this.recentSearches.push(city);
      localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
    }
  }

  highlight(option: string, value: string): string {
    const re = new RegExp(value, 'gi');
    return option.replace(re, `<b>${value}</b>`);
  }

  searchWeather() {
    const city = this.searchForm.get('city')!.value;
    this.saveRecentSearch(city);
    this.service.getWeather(city).subscribe(
      (resp) => {
        this.weather = resp;
        this.errorMessage = null;
        this.currentCityName = city;
        const countryCode = resp.sys.country;
        this.countryFlagUrl = `https://flagcdn.com/256x192/${countryCode?.toLowerCase() ?? 'unknown'}.png`;
        this.countryName = countryCode;
        this.setBodyBackground(resp.weather[0].main, resp.sys.sunrise, resp.sys.sunset);
        this.showPhotos = true; // Add this line
      },
      (error) => {
        this.errorMessage = 'Failed to fetch weather data. Please try again.';
        this.showPhotos = false; // Add this line
      }
    );
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.getWeatherByCoords(lat, lon);
        },
        (error) => {
          this.errorMessage = 'Geolocation is not enabled or available.';
        }
      );
    } else {
      this.errorMessage = 'Geolocation is not supported by this browser.';
    }
  }

  getWeatherByCoords(lat: number, lon: number) {
    this.service.getWeatherByCoordinates(lat, lon).subscribe(
      (resp) => {
        this.weather = resp;
        this.errorMessage = null;

        const countryCode = resp.sys.country;
        this.countryFlagUrl = `https://flagcdn.com/256x192/${countryCode?.toLowerCase() ?? 'unknown'}.png`;
        this.countryName = countryCode;
        this.setBodyBackground(resp.weather[0].main, resp.sys.sunrise, resp.sys.sunset);
        this.showPhotos = true; // Add this line
      },
      (error) => {
        this.errorMessage = 'Failed to fetch weather data using your location.';
        this.showPhotos = false; // Add this line
      }
    );
  }

  setBodyBackground(weatherCondition: string, sunrise: number, sunset: number) {
    const currentTime = Math.floor(Date.now() / 1000);
    this.isDay = currentTime >= sunrise && currentTime <= sunset;
    const body = document.querySelector('body')!;

    switch (weatherCondition.toLowerCase()) {
      case 'clear':
        body.style.backgroundImage = this.isDay
          ? "url('assets/images/clear-sky-day.jpg')"
          : "url('assets/images/clear-sky-night.jpg')";
        break;
      case 'clouds':
        body.style.backgroundImage = this.isDay
          ? "url('assets/images/cloudy-sky-day.jpg')"
          : "url('assets/images/cloudy-sky-night.jpg')";
        break;
      case 'rain':
        body.style.backgroundImage = this.isDay
          ? "url('assets/images/rainy-sky-day.jpg')"
          : "url('assets/images/rainy-sky-night.jpg')";
        break;
      case 'snow':
        body.style.backgroundImage = this.isDay
          ? "url('assets/images/snowy-sky-day.jpg')"
          : "url('assets/images/snowy-sky-night.jpg')";
        break;
      default:
        body.style.backgroundImage = this.isDay
          ? "url('assets/images/default-weather-day.jpg')"
          : "url('assets/images/default-weather-night.jpg')";
        break;
    }
  }

}
