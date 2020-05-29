import { AfterViewInit, Component, ElementRef, Input, Output, SimpleChange, EventEmitter } from '@angular/core';
import { HttpService } from '../http.service';

import * as d3 from 'd3';
import * as topojson from 'topojson';

@Component({
  selector: 'app-globe',
  templateUrl: './globe.component.html',
  styleUrls: ['./globe.component.css']
})
export class GlobeComponent implements AfterViewInit {
  @Input() country;
  @Output() countrySelection = new EventEmitter();

  constructor(
    private httpService: HttpService,
    private elementRef: ElementRef
    ) { }

  ngAfterViewInit(): void {
    let height = this.elementRef.nativeElement.parentNode.offsetHeight;
    let width = this.elementRef.nativeElement.parentNode.offsetWidth;

    this.httpService.getTopography()
      .subscribe((world: any) => 
        {
          let graticule = d3.geoGraticule10();
          let projection = d3.geoOrthographic().fitExtent([[0, 10], [width, height -10]], {type: 'Sphere'});
          let path = d3.geoPath(projection);
          let countries = topojson.feature(world, world.objects.countries).features;

          let svg = d3.select('app-globe')
            .append('svg')
            .attr('height', height)
            .attr('width', width);

          svg.append('path')
            .datum(graticule)
            .attr('d', path)
            .style('fill', 'none')
            .attr('stroke', '#999');

          svg.append('g')
              .style('cursor', 'pointer')
            .selectAll('path')
            .data(countries)
            .join('path')
              .attr('d', path)
              .attr('id', d => d.properties.name.replace(/ |\./g, ''))
              .on('click', d => {this.countrySelection.emit(d.properties.name)})
            .append('title')
              .text(d => d.properties.name);

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
        let prevID = change.country.previousValue.label.replace(/ |\./g, '');
        d3.select(`#${prevID}`).style('fill', '#000');
      }
      let id = this.country.label.replace(/ |\./g, '');
      d3.select(`#${id}`).style('fill', '#4287f5');
    }
  }
}
