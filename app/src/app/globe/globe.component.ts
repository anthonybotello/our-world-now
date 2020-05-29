import { OnInit, AfterViewInit, Component, ElementRef, Input, Output, SimpleChange, EventEmitter } from '@angular/core';
import { HttpService } from '../http.service';

import * as d3 from 'd3';
import * as topojson from 'topojson';

@Component({
  selector: 'app-globe',
  templateUrl: './globe.component.html',
  styleUrls: ['./globe.component.css']
})
export class GlobeComponent implements OnInit, AfterViewInit {
  @Input() country;
  @Output() countrySelection = new EventEmitter();

  countries;

  constructor(
    private httpService: HttpService,
    private elementRef: ElementRef
    ) { }

  ngOnInit(): void {
    this.httpService.getCountries()
      .subscribe(countries => {this.countries = countries});
  }

  ngAfterViewInit(): void {
    let height = this.elementRef.nativeElement.parentNode.offsetHeight;
    let width = this.elementRef.nativeElement.parentNode.offsetWidth;

    this.httpService.getTopography()
      .subscribe((world: any) => 
        {
          let graticule = d3.geoGraticule10();
          let projection = d3.geoOrthographic().fitExtent([[0, 10], [width, height -10]], {type: 'Sphere'});
          let path = d3.geoPath(projection);
          let land = topojson.feature(world, world.objects.countries).features;

          let svg = d3.select('app-globe')
            .append('svg')
            .attr('height', height)
            .attr('width', width);

          svg.append('path')
            .datum(graticule)
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', '#999');

          svg.append('g')
            .selectAll('path')
            .data(land)
            .join('path')
              .attr('d', path)
              .attr('id', d => d.properties.code)
              .attr('fill','#555')
            .append('title')
              .text(d => d.properties.name);

          for (let c of this.countries){
            d3.select(`#${c.code}`)
              .style('cursor', 'pointer')
              .attr('fill', '#000')
              .on('click', () => this.countrySelection.emit(c));
          }

          d3.timer(elapsed =>
            {
              projection.rotate([-0.006 * elapsed, -20, 0]);
              svg.selectAll('path')
                  .attr('d', path);
            })
        });
  }

  ngOnChanges(change: any): void {
    if (this.country){
      if (change.country.previousValue){
        let prevID = change.country.previousValue.code;
        d3.select(`#${prevID}`).style('fill', '#000');
      }
      let id = this.country.code;
      d3.select(`#${id}`).style('fill', '#4287f5');
    }
  }
}
