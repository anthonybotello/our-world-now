import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient
  ) { }

  getTopography(){
    return this.http.get('assets/countries-110m.json');
  }

  getCountries(){
    return this.http.get('assets/countries.json');
  }

  getNews(countryCode: String){
    return this.http.get(`news/${countryCode}`);
  }

  getTwitter(woeid: Number){
    return this.http.get(`twitter/${woeid}`);
  }

  getNewsTest(){
    return this.http.get('assets/newsTest.json');
  }
  getTwitterTest(){
    return this.http.get('assets/twitterTest.json');
  }
}
