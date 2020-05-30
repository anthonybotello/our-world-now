import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient //Injects the HttpClient module to make HTTP requests.
  ) { }

  getTopography(){//Retrieves the topographical data used to construct the globe.
    return this.http.get('assets/countries-110m.json');
  }

  getCountries(){//Retrieves the list of selectable countries.
    return this.http.get('assets/countries.json');
  }

  getNews(countryCode: String){//Sends a request for news data for a selected country to the server. Takes the selected country's alpha 2 code as a parameter.
    return this.http.get(`news/${countryCode}`);
  }

  getTwitter(woeid: Number){//Sends a request for Twitter data for a selected country to the server. Takes the selected country's WOEID (Where on Earth ID) as a parameter.
    return this.http.get(`twitter/${woeid}`);
  }
  
}
