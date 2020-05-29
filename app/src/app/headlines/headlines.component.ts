import { Component, OnInit, Input, SimpleChange } from '@angular/core';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-headlines',
  templateUrl: './headlines.component.html',
  styleUrls: ['./headlines.component.css']
})
export class HeadlinesComponent implements OnInit {
  @Input() country;
  news;
  noNews;

  twitterHashtags;
  twitterQueries;
  noTwitter;

  constructor(
      private httpService: HttpService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChange){
      this.httpService.getNews(this.country.code)
      .subscribe((data: any) => {
        this.noNews = data.length === 0;
        if (!this.noNews){
          this.news = data.slice(0,5);
        }
      });
      
      this.httpService.getTwitter(this.country.woeid)
      .subscribe((data: any) => {
        this.noTwitter = this.country.woeid === null;
        if (!this.noTwitter){
          this.twitterHashtags = data.filter(d => d.name.startsWith('#')).slice(0,5);
          this.twitterQueries = data.filter(d => !d.name.startsWith('#')).slice(0,5);
        }
      });

      // this.httpService.getNewsTest()
      // .subscribe((data: any) => {
      //   this.news = data.articles;
      // });
      
      // this.httpService.getTwitterTest()
      // .subscribe((data: any) => {
      //   this.twitterHashtags = data.filter(d => d.name.startsWith('#')).slice(0,5);
      //   this.twitterQueries = data.filter(d => !d.name.startsWith('#')).slice(0,5);
      // });
  }
}
