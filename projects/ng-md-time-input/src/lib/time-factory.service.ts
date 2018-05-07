import { Injectable } from '@angular/core';
// Moment
import { Moment, utc } from "moment";
import moment from "moment";

@Injectable({
  providedIn: 'root'
})
export class TimeFactoryService {

    constructor() { }

    /**
     * Resets the given time object to the beginning of its day.
     * This function is a pure fonction, which means that the state of the
     * given timeObject will not be changed.
     * @param timeObject The time object to reset.
     * @param isUTC If the given time object is invalid, do we want the returned date
     * to be the current date in UTC format or no.
     * @returns A clone of the given timeObject, with its time set to the beginning of the day.
     * If the timeObject is null, undefined or invalid, today will be used as date.
     */
    resetTime(timeObject: Moment, isUTC: boolean = true): Moment {
        let time: Moment;

        if (!timeObject || !timeObject.isValid()) {
            time = isUTC ? utc() : moment();
        }
        else {
            time = timeObject.clone();
        }

        return time.startOf('day');
    }

    createTime(isUTC: boolean = true) {
        return isUTC ? utc() : moment();
    }

}
