import { Component, OnInit, Output, EventEmitter,  ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { debounceTime, map, switchMap, catchError, startWith } from 'rxjs/operators';

interface OpenWeatherGeocodingResponse {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

@Component({
  selector: 'app-search',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
  
})
export class SearchComponent implements OnInit {
  searchForm!: FormGroup;
  errorMessage: string | null = null;
  filteredOptions!: Observable<string[]>;
  private cache: { [key: string]: string[] } = {};

  @Output() searchCityEvent = new EventEmitter<string>();
  @Output() useLocationEvent = new EventEmitter<void>();

  private openWeatherApiKey: string = 'c2f660820d8c405c89b61b5615b32269';
  private openWeatherGeocodingUrl: string = 'http://api.openweathermap.org/geo/1.0/direct';

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      city: [null, Validators.required]
    });

    this.filteredOptions = this.searchForm.get('city')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap((value: string) => this._filter(value || ''))
    );
  }

  private _filter(value: string): Observable<string[]> {
    if (value.length < 2) {
      return of([]);
    }

    if (this.cache[value]) {
      return of(this.cache[value]);
    }

    return this.http
      .get<OpenWeatherGeocodingResponse[]>(`${this.openWeatherGeocodingUrl}?q=${value}&limit=5&appid=${this.openWeatherApiKey}`)
      .pipe(
        map((response) => {
          const options = response.map((result) => result.name);
          this.cache[value] = options;
          return options;
        }),
        catchError(() => {
          this.errorMessage = 'Failed to fetch city names. Please try again later.';
          return of([]);
        })
      );
  }

  highlight(option: string, value: string): string {
    const re = new RegExp(value, 'gi');
    return option.replace(re, `<b>${value}</b>`);
  }

  searchWeather() {
    const city = this.searchForm.get('city')!.value;
    this.searchCityEvent.emit(city);
  }

  getLocation() {
    this.useLocationEvent.emit();
  }
}
