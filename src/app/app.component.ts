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
    required = false;
    public testTime = moment.duration();

    constructor() {
    }

    testChange(event) {
        console.log(event);
    }

}
