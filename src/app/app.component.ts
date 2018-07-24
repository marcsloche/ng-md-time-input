import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Moment
import { Moment } from "moment";
import { utc, duration } from "moment";
import { MomentTimeAdapter } from '../../projects/ng-md-time-input/src/public_api';

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
    testDuration = duration();
    testTime = utc();
    timeAdatper = new MomentTimeAdapter();
    testValue = "Hi!";
    showDays = true;

    constructor(private fb: FormBuilder) {

        this.formGroup = fb.group({
            timeInput: ["", Validators.required],
            durationInput: ["", Validators.required]
        });

/*         setTimeout(() =>  {
            this.testValue = "fdfasdd";
            this.formGroup.disable();
            // this.formGroup.get('timeInput').setErrors({invalid: 'invalid'});
        }, 5000); */
    }

    testChange(event) {
        console.log("Changed:", event);
    }
    testInput(event) {
        console.log("Input:", event);
    }

    getDuration(): string {
        if (this.testDuration) {
            return Math.floor(this.testDuration.asDays()) + "d" + this.testDuration.hours() + ":" + this.testDuration.minutes();
        }

        return "";
    }

}
