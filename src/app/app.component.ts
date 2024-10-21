import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WeatherService } from './service/weather.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  searchForm!: FormGroup;
  weather: any;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private service: WeatherService) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      city: [null, Validators.required]
    });
  }

  searchWeather() {
    const city = this.searchForm.get('city')!.value;
    this.service.getWeather(city).subscribe(
      (resp) => {
        this.weather = resp;
        this.errorMessage = null;
      },
      (error) => {
        this.errorMessage = 'Failed to fetch weather data. Please try again.';
      }
    );
  }
}
