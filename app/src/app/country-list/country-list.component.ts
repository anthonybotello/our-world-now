import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-country-list',
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.css']
})
export class CountryListComponent implements OnInit {
  countries = [];
  @Input() country;
  @Output() countrySelection = new EventEmitter();

  constructor(
    private httpService: HttpService
  ) { }

  ngOnInit(): void {
    this.httpService.getCountries()
      .subscribe((countries: any) => {
        for(let c in countries){
          this.countries.push(countries[c]);
        }
      });
  }

  onChange(country: any)
  {
    this.countrySelection.emit(country.label);
  }

}
