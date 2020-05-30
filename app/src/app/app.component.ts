import { Component } from '@angular/core';

//Part of a possible solution for the reset feature.
// import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'Our World Now';
  rotation: boolean = true; //The rotation field determines whether globe is rotating or not.
  country: any; //The 'country' field contains object with the selected country's information.

  constructor(){ }

  onCountrySelection(country: any): void {
    //When this component receives a 'countrySelection' event from one of its child components,  the value of the 'country' field is set to the object provided by the event.
    this.country = country;
  }
  
  onRotationAction(rotation: boolean): void {
    //When this component receives a 'rotationAction' event from the globe, the value of the 'rotation' field is set to the boolean provided by the event.
    this.rotation = rotation;
  }

  action(): void {
    //When the rotation action button is clicked, changes the value of the 'rotation' field to its negative, determining whether the globe is rotating and which of the pause or play button is displayed.
    this.rotation = !this.rotation;
  }

  //The reset feature is not yet functional. It's purpose is to reset the state of the application to its original state with no selected country and the globe in its original alignment.
  // reset(): void {
  //   d3.selectAll('svg').dispatch('reset');
  // }
}
