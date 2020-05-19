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
    return this.http.get('/assets/countries-110m.json');
  }

  getCountries(){
    return this.http.get('/assets/countries.json');
  }

  getArticles(countryCode: String)
  {
    let url = `http://newsapi.org/v2/top-headlines?country=${countryCode}&apiKey=`;
    return this.http.get(url);
  }
}
