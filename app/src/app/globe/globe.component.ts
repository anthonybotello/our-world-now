import { OnInit, AfterViewInit, Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { HttpService } from '../http.service';

//The following JavaScript modules are used to construct the globe component.
import * as d3 from 'd3'; //The 'd3' module is used to construct the various elements that make up the globe, to bind topographical data to these elements, and to program the globe's functionality.
import { feature } from 'topojson'; //The 'feature' function from the 'topojson' module is used to process the topographical data into a useable form.
import * as versor from 'versor'; //The 'versor' module is used to compute the mathematics that allow users to rotate the globe manually.

@Component({
  selector: 'app-globe',
  templateUrl: './globe.component.html',
  styleUrls: ['./globe.component.css']
})
export class GlobeComponent implements OnInit, AfterViewInit {
  @Input() country; //The 'country' field is received as input from the parent component.
  @Input() rotation; //The 'rotation' field is received as input from the parent component.
  @Output() countrySelection = new EventEmitter(); //The 'countrySelection' event is emitted when a country is selected on the globe.
  @Output() rotationAction = new EventEmitter(); //The 'rotationAction' event is emitted whenever the rotation is paused or initialized on the globe.

  countries: any[]; //The 'countries' field contains the list of objects representing selectable countries.

  constructor(
    private httpService: HttpService, //The HttpService is injected to retrieve the list of countries and the topographical data.
    private elementRef: ElementRef //The ElementRef object is injected to retrieve dimensional data from the document.
    ) { }

  ngOnInit(): void {
    //When the component is initialized the HttpService retrieves the list of selectable countries.
    this.httpService.getCountries()
      .subscribe((countries: any) => this.countries = countries);
  }

  ngAfterViewInit(): void {
    //The construction of the globe must take place AFTER the view is initialized because the height and width of the containing element are necessary to determine the size of the globe.
    let height = this.elementRef.nativeElement.parentNode.offsetHeight;
    let width = this.elementRef.nativeElement.parentNode.offsetWidth;

    this.httpService.getTopography()
      .subscribe((world: any) => {//After the view is initialized the HttpService retrieves the topographical land data for the countries of the world.

          let graticule = d3.geoGraticule10();//Returns the topographical data for the globe's 10 degree graticule as a  geometry object.
          let projection = d3.geoOrthographic().fitExtent([[0, 10], [width, height -10]], {type: 'Sphere'});//Returns an object that projects the globe's spherical geography onto a 2D plane.
          let path = d3.geoPath(projection);//Creates a function 'path' that takes a geometry object and renders a line path within the given projection.

          let land = feature(world, world.objects.countries).features;//Returns a collection of geographical features from the topographical land data retrieved by the HttpService.

          let svg = d3.select('app-globe')
            .append('svg') //Creates a child SVG element inside the app-globe component with the height and width of the container.
            .attr('height', height)
            .attr('width', width);

          svg.append('path')//Creates a child path element inside the previous SVG element.
            .datum(graticule)//Selects the graticule data.
            .attr('d', path)//Binds the graticule data to the path and renders the path from the graticule data using the 'path' function.
            .attr('fill', 'none')
            .attr('stroke', '#999');

          svg.append('g')//Creates a g element inside the SVG element to group all of the land paths.
            .selectAll('path')//Creates a path element inside of the g element for each country.
            .data(land)//Selects the land data.
            .join('path')
              .attr('d', path)//Binds each country's land data to their respective path and renders the path for each country.
              .attr('id', d => d.properties.code)//Gives each path element a unique ID determined by their alpha 2 code.
              .attr('fill','#555')//Fills the path of each country with a gray color.
            .append('title')//Creates a title element for each path with the name of the country.
              .text(d => d.properties.name);

          for (let c of this.countries){//Iterates through the list of selectable countries retrieved when the component was initialized.
            d3.select(`#${c.code}`)//Selects the path element by its ID using the selectable country's alpha 2 code.
              .style('cursor', 'pointer')//Changes the cursor that appears over the path element to differentiate it as selectable.
              .attr('fill', '#000')//Fills the path element with black to differentiate it as selectable.
              .on('click', () => this.countrySelection.emit(c));//Binds an event listener to the path that when clicked emits the 'countrySelection' event which passes the selected country to the parent component.
          }

          let timer;
          spin(projection.rotate());//initializes the rotation of the globe.

          svg.call(drag(projection).on('drag.end', () => {//calls the 'drag' function defined below on the SVG element which allows the user to manually rotate the globe by dragging it.
            this.rotationAction.emit(false);//When the globe is dragged the 'rotationAction' event with an argument of 'false' is emitted to pause the rotation.
            render();//The globe is then rendered to display its newly rotated position.
          }));

          svg.on('rotation', () => {//Binds an event listener to the SVG for the 'rotation' event that is emitted whenever the rotation action changes.
            if(this.rotation){//If the 'rotation' field is changed to true, the rotation is re-initialized.
              spin(projection.rotate());
            }
            else{//If the 'rotation' field is changed to false, stops the rotation.
              timer.stop();
            }
          });

          //Part of the solution for the in-progress reset feature.
          // svg.on('reset', () => {
          //   timer.stop();
          //   spin(projection.rotate([90, -15, 0]));
          //   this.rotationAction.emit(true);
          // });

          function render(){//re-renders the path when called.
            svg.selectAll('path')
              .attr('d', path);
          }

          function spin(angles){//Initiates rotation of the globe.
            timer = d3.timer(timeElapsed => {//The 'timer' method continuously invokes the given callback function.
              projection.rotate([angles[0] - (0.009 * timeElapsed), angles[1], angles[2]]);//Each time the callback is invoked the globe's projection is rotated. The new angle is determined by the time elapsed since the rotation started.
              render();//The globe is re-rendered each time the projection is rotated.
            });
          }

          //The code for the drag function was borrowed from d3's example gallery.
          //Bostock, M. (2018) 'Versor Dragging' https://observablehq.com/@d3/versor-dragging
          function drag(projection){
            let v0, q0, r0;

            function dragstarted(){
              v0 = versor.cartesian(projection.invert([d3.event.x, d3.event.y]));
              q0 = versor(r0 = projection.rotate());
            }

            function dragged(){
              timer.stop();
              const v1 = versor.cartesian(projection.rotate(r0).invert([d3.event.x, d3.event.y]));
              const q1 = versor.multiply(q0, versor.delta(v0, v1));
              projection.rotate(versor.rotation(q1));
            }

            return d3.drag()
              .on('start', dragstarted)
              .on('drag', dragged);
          }
      });
  }

  ngOnChanges(change: any): void {//This method is called whenever there is a change in the 'country' or 'rotation' fields.

    if(change.rotation){//Checks to see if the change was to the 'rotation' field.
      d3.selectAll('svg').dispatch('rotation');//Emits the 'rotation' event to the SVG object. The event is handled as shown above.
    }
    else if(this.country){//Checks to see if the 'country' field is defined -- i.e., if a country is selected.

      let id = this.country.code;
      d3.select(`#${id}`).style('fill', '#4287f5');//Selects the path element of the currently selected country and fills it with a blue color to show that it is selected.

      if (change.country.previousValue){//Checks if another country was selected previously.

        let prevID = change.country.previousValue.code;
        d3.select(`#${prevID}`).style('fill', '#000');//Selects the path element of the previously selected country and fills it with black to show that it is no longer selected.
      
      }
    }
  }
  
}
