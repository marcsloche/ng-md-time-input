import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
// Moment
import { Moment } from "moment";
import * as moment from "moment";

/**
 * This is a playground where you can manually test the ng-md-time-input.
 */
@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"]
})
export class AppComponent {
    formGroup: FormGroup;
    title = "app";
    required = true;
    public testTime = null;
    testValue = "Hi!";
    showDays = true;

    constructor(private fb: FormBuilder) {
        this.formGroup = fb.group({
            timeInput: ["", Validators.required]
        });

        setTimeout(() =>  {
            this.formGroup.get('timeInput').setErrors({invalid: 'invalid'});
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
            return (
                Math.floor(this.testTime.asDays()) +
                "d" +
                this.testTime.hours() +
                ":" +
                this.testTime.minutes()
            );
        }

        return "";
    }

    toggleDisableState() {
        if (this.formGroup.get("timeInput").enabled) {
            this.formGroup.get("timeInput").disable();
        } else {
            this.formGroup.get("timeInput").enable();
        }
    }
}
