import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
// Moment
import { Moment } from "moment";
import * as moment from "moment";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    formGroup: FormGroup;
    title = 'app';
    required = false;
    disabled = false;
    public testTime = moment.duration();
    testValue = "Hi!";
    showDays = false;

    constructor(private fb: FormBuilder) {

        this.formGroup = fb.group({
            timeInput: [""]
        });

        setTimeout(() =>  {
            this.testValue = "fdfasdd";
            this.formGroup.disable();
            // this.formGroup.get('timeInput').setErrors({invalid: 'invalid'});
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
