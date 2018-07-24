import { Duration,  Moment, isMoment, isDuration } from "moment";
import { MomentDurationAdapter, MomentTimeAdapter, TimeInputAdapter } from "../adapters";


/**
 * This class handles all of the time adapters manipulation. It acts
 * as the model for the time input. That way, the component only has
 * to handle the view manipulations.
 **/
 export class TimeInputModel {
    private readonly NUMBER_OF_MINUTES_IN_HOUR = 60;
    private readonly NUMBER_OF_MINUTES_IN_DAY = 1440;
    private readonly MAX_TIME_WITH_DAYS = 143999; // 99d 23:59
    private readonly MAX_TIME_WITHOUT_DAYS = 1439; // 23:59
    private _temporalObject: Duration | Moment | Date;
    private _temporalObjectAdapter: TimeInputAdapter<Moment | Duration | Date>;
    private _maxTimeInMinutes = this.MAX_TIME_WITH_DAYS; // 99d 23:59
    // The original time is kept to be complient with the initial value
    // that was given to this input. Since we don't handle the years and
    // months, we don't want to change these values when changer the time.
    private _originalTemporalObject: Duration | Moment | Date;

    /**
     * Sets the value of the model to the given string values.
     * If any param is an empty string, this param won't change the model.
     * @param daysString The number of days to set.
     * @param hoursString The number of hours to set.
     * @param minutesString The number of minutes to set.
     */
    updateTime(daysString: string, hoursString: string, minutesString: string): void {
        // First of, we parse the strings to number in order to validate if they are numbers.
        let days = parseInt(daysString, 10);
        let hours = parseInt(hoursString, 10);
        let minutes = parseInt(minutesString, 10);

        // The strings can be NaN if they are empty, null, undefined or contain a letter.
        if (
            Number.isNaN(days) &&
            Number.isNaN(hours) &&
            Number.isNaN(minutes)
        ) {
            this._temporalObject = null;
        } else {
            days = Number.isNaN(days) ? 0 : days;
            hours = Number.isNaN(hours) ? 0 : hours;
            minutes = Number.isNaN(minutes) ? 0 : minutes;

            this.setTime(days, hours, minutes);
        }
    }

    getTemporalObject(): Duration | Moment | Date {
        return this._temporalObject;
    }

    /**
     * Initializes the temporal object and adapter to use in this model.
     * The temporal object will be changed
     * @param object The temporal object to use as the current one.
     * @param temporalObjectAdapter The adapter to use with this temporal object.
     * this is mostly useful when the given temporal object is null since we need
     * to know the desired type of temporal object to create when the user changes
     * the time value in the input. If the adapter is not specified, we will infer
     * the proper adapter to use from the given temporal object.
     */
    setTemporalObject(object: Duration | Moment | Date, temporalObjectAdapter ?: TimeInputAdapter<Duration | Moment | Date>) {

        if(!temporalObjectAdapter) {
            this.inferAdapterFromTemporalObject(object);
        }
        else {
            this._temporalObjectAdapter = temporalObjectAdapter;
        }

        this._temporalObject = this._temporalObjectAdapter.clone(object);
        this._originalTemporalObject = object;
    }

    /**
     * Determines which temporal object adapter is needed to handle the given object
     * and sets the proper apdater in the model.
     * @param object The temporal object used to determine which temporal object adapter is needed.
     */
    private inferAdapterFromTemporalObject(object: Duration | Moment | Date): void {
        if(isMoment(object)) {
            this._temporalObjectAdapter = new MomentTimeAdapter();
        }
        else if(isDuration(object)) {
            this._temporalObjectAdapter = new MomentDurationAdapter();
        }
        else if(object instanceof Date) {
            throw new Error("Native javascript dates are not supported yet.");
        }
        else if(!object) {
            throw new Error("An temporal object adapter must be specified if the object is null.");
        }
        else {
            throw new Error("Unsupported temporal object type in TimeInputModel. Only Moments, Moment.durations and Dates are allowed.");
        }
    }

    private setTime(days: number, hours: number, minutes: number) {
        const timeInMinutes =
            days * this.NUMBER_OF_MINUTES_IN_DAY +
            hours * this.NUMBER_OF_MINUTES_IN_HOUR +
            minutes;
        // If the time is greater than the max time, set it to the max time.
        if (timeInMinutes > this._maxTimeInMinutes) {
            this._temporalObject = this.createNewTemporalObject(
                this._originalTemporalObject,
                0,
                0,
                this._maxTimeInMinutes
            );
        }
        // Else, if the time is negative, set it to 0.
        else if (timeInMinutes < 0) {
            this._temporalObject = this.createNewTemporalObject(this._originalTemporalObject, 0, 0, 0);
        } else {
            this._temporalObject = this.createNewTemporalObject(
                this._originalTemporalObject,
                0,
                0,
                timeInMinutes
            );
        }
    }

    /**
     * This is a factory method to create a new temporal object from the given value.
     * If this value is falsy or invalid, it will create a new time from scratch.
     */
    private createNewTemporalObject(
        from: Duration | Moment | Date,
        days: number,
        hours: number,
        minutes: number
    ): Duration | Moment | Date {
        if (from && this._temporalObjectAdapter.isValid(from)) {
            return this._temporalObjectAdapter.createFrom(
                from,
                days,
                hours,
                minutes
            );
        } else {
            return this._temporalObjectAdapter.create(days, hours, minutes);
        }
    }
 }
