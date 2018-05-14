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
    testValue = "Hi!";
    showDays = false;
    disabled = false;

    constructor() {
        setTimeout(() =>  {
            this.testValue = "fdfasdd";
            this.disabled = true;
        }, 5000);
    }

    testChange(event) {
        console.log("Changed:", event);
    }
    testInput(event) {
        console.log("Input:", event);
    }

    getTime(): string {
        if (this.testTime) {
            return Math.floor(this.testTime.asDays()) + "d" + this.testTime.hours() + ":" + this.testTime.minutes();
        }

        return "";
    }

}
