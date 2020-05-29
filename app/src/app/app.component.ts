import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Our World Now';
  country;

  constructor(){ }

  onCountrySelection(country: any): void {
    this.country = country;
  }
}
