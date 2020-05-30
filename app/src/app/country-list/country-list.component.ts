import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-country-list',
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.css']
})
export class CountryListComponent implements OnInit {

  @Input() country: any;  //This component receives the value of the 'country' field as input from the main component.
  @Output() countrySelection = new EventEmitter(); //This component emits a 'countrySelection' to the main component.
  
  countries: any[]; //The countries field contains a list of objects representing selectable countries.

  constructor(
    private httpService: HttpService //The HttpService is injected into to retrieve the list of countries.
  ) { }

  ngOnInit(): void {
    //When the component is initialized, it uses the HttpService to retrieve the list of countries.
    this.httpService.getCountries()
      .subscribe((countries: any) => {
        this.countries = countries; 
      });
  }

  onChange(country: any): void {
    //When a new country is selected from the list, this component emits a 'countrySelection' event containing an object with the country's information.
    this.countrySelection.emit(country);
  }

}
