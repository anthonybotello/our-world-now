import { Component, OnInit } from '@angular/core';
import { HttpService } from './http.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Our World Now';
  countries;
  country;

  constructor(private httpService: HttpService){ }

  ngOnInit(): void {
    this.httpService.getCountries()
      .subscribe(c => {
        this.countries = c;
      })
  }

  onCountrySelection(country: any): void {
    this.country = this.countries[country];
  }
}
