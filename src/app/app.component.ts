import { Component } from '@angular/core';
// Moment
import { Moment } from "moment";
import * as moment from "moment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  public testTime = moment.utc().set({day: 15});


}
