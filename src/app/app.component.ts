import { Component, OnInit } from '@angular/core';
import { WeatherService } from './service/weather.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  weather: any;
  errorMessage: string | null = null;
  currentCityName: string | null = null;
  isDay: boolean = true;
  countryFlagUrl: string | null = null;
  countryName: string | null = null;
  showPhotos: boolean = false;

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {}

  // Receive weather data from SearchComponent
  receiveWeatherData(weatherData: any) {
    this.weather = weatherData;
    this.currentCityName = weatherData.name;
    const countryCode = weatherData.sys.country;
    this.countryFlagUrl = `https://flagcdn.com/256x192/${countryCode?.toLowerCase() ?? 'unknown'}.png`;
    this.countryName = countryCode;
    this.setBodyBackground(weatherData.weather[0].main, weatherData.sys.sunrise, weatherData.sys.sunset);
    this.showPhotos = true;
  }

  setBodyBackground(weatherCondition: string, sunrise: number, sunset: number) {
    const currentTime = Math.floor(Date.now() / 1000);
    this.isDay = currentTime >= sunrise && currentTime <= sunset;
    const body = document.querySelector('body')!;

    switch (weatherCondition.toLowerCase()) {
      case 'clear':
        body.style.backgroundImage = this.isDay ? "url('assets/images/clear-sky-day.jpg')" : "url('assets/images/clear-sky-night.jpg')";
        break;
      case 'clouds':
        body.style.backgroundImage = this.isDay ? "url('assets/images/cloudy-sky-day.jpg')" : "url('assets/images/cloudy-sky-night.jpg')";
        break;
      case 'rain':
        body.style.backgroundImage = this.isDay ? "url('assets/images/rainy-sky-day.jpg')" : "url('assets/images/rainy-sky-night.jpg')";
        break;
      case 'snow':
        body.style.backgroundImage = this.isDay ? "url('assets/images/snowy-sky-day.jpg')" : "url('assets/images/snowy-sky-night.jpg')";
        break;
      default:
        body.style.backgroundImage = this.isDay ? "url('assets/images/default-weather-day.jpg')" : "url('assets/images/default-weather-night.jpg')";
        break;
    }
  }
}
