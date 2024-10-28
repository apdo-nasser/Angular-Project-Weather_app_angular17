import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent {
  @Input() weather: any;
  @Input() currentCityName: string | null = null;
  @Input() countryFlagUrl: string | null = null;
  @Input() countryName: string | null = null;
  @Input() isDay: boolean = true;
}
