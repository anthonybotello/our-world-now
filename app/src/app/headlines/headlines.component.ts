import { Component, OnInit, Input, SimpleChange } from '@angular/core';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-headlines',
  templateUrl: './headlines.component.html',
  styleUrls: ['./headlines.component.css']
})
export class HeadlinesComponent implements OnInit {
  @Input() country;
  articles;
  noData;

  constructor(
      private httpService: HttpService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChange){
      this.httpService.getArticles(this.country.code)
      .subscribe((data: any) => {
        this.noData = data.totalResults === 0;
        this.articles = data.articles.slice(0,5);
      });
  }

}
