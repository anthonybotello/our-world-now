import { Component, OnInit, Input } from '@angular/core';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-headlines',
  templateUrl: './headlines.component.html',
  styleUrls: ['./headlines.component.css']
})
export class HeadlinesComponent implements OnInit {
  @Input() country; //The 'country' field's value is received as input from the parent component. 

  news: any[]; //List of news articles.
  noNews: boolean; //Boolean whose value is true if there is no news data available for the selected country.

  hashtags: any[]; //List of Twitter hashtags.
  queries: any[]; //List of Twitter queries.
  noTwitter: boolean; //Boolean whose value is true if there is no twitter data available for the selected country.

  constructor(
      private httpService: HttpService //The HttpService is injected to retrieve the news/Twitter data from the server.
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(change: any): void {//This method is called whenever there is a change to the value of the 'country' field.
  
    if(this.country){//If a country is selected, the HttpService attemps to retrieve news and Twitter data from the server.

      this.httpService.getNews(this.country.code) //A request for news data requires the selected country's alpha 2 code as a parameter.
        .subscribe((data: any) => {
        //A response is received in the form of a list of news article objects.
        this.noNews = data.length === 0; //If the list is empty, the 'noNews' field is set to true;

        if (!this.noNews){
          this.news = data.slice(0,5);//If the list is not empty, the 'news' field is set to a list of the first 5 articles in the list.
        }
      });
      
      if(this.country.woeid !== null){//Checks if the selected country has a WOEID necessary to retrieve Twitter data.

        this.noTwitter = false; //If Twitter data is available, the 'noTwitter' field is set to false.

        this.httpService.getTwitter(this.country.woeid) //A request for Twitter data requires the selected country's WOEID (Where on Earth ID) as a parameter.
          .subscribe((data: any) => {
            //A response is received in the form of a list of Twitter trend objects. The list is then split into separate lists for hashtags and queries.
            this.hashtags = data.filter(d => d.name.startsWith('#')).slice(0,5); //The 'hashtags' field is set to a list of the first 5 trends in the trend list filtered by hashtags.
            this.queries = data.filter(d => !d.name.startsWith('#')).slice(0,5); //The 'queries' field is set to a list of the first 5 trends in the trend list filtered by queries.
        });

      }
      else{
        this.noTwitter = true; //If the selected country doesn't have a WOEID then there is no Twitter data available for it and so the 'noTwitter' field is set to true.
      }
    }
  }
  
}
