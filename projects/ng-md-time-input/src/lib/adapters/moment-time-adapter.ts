// Moment
import { Moment, utc, isMoment } from "moment";
import { TimeInputAdapter } from "./time-input-adapter";

export class MomentTimeAdapter implements TimeInputAdapter<Moment> {
    private readonly NUMBER_OF_MINUTES_IN_HOUR = 60;
    private readonly NUMBER_OF_MINUTES_IN_DAY = 1440;

    constructor() {}

    clone(object: Moment): Moment {
        return object.clone();
    }

    /**
     * Factory method to create new object of type T.
     * @param days The number of days to include in the temporal object.
     * @param hours The number of hours to include in the temporal object.
     * @param minutes The number of minutes to include in the temporal object.
     */
    create(days: number, hours: number, minutes: number): Moment {
        return utc().set({
            date: days,
            hours,
            minutes,
            seconds: 0,
            millisecond: 0
        });
    }

    /**
     * Creates a new temporal object from the given object and sets the time
     * to the given values.
     * @param object The temporal object used to create the new temporal object.
     * @param days The number of days to set. The value 0 is skipped since the first day of the month is 1.
     * @param hours The number of hours to set.
     * @param minutes The number of minutes to set.
     */
    createFrom(
        object: Moment,
        days: number,
        hours: number,
        minutes: number
    ): Moment {
        let newTime;
        // The days cannot be set to 0 since the first day of the month is 1. Skipping it.
        if (days <= 0) {
            newTime = utc(object).set({
                hours,
                minutes,
                seconds: 0,
                millisecond: 0
            });
        } else {
            newTime = utc(object).set({
                date: days,
                hours,
                minutes,
                seconds: 0,
                millisecond: 0
            });
        }

        // Gets the month and year from the given object.
        newTime.month(object.month());
        newTime.year(object.year());

        return newTime;
    }

    /**
     * Tests if the given object has the right type.
     * @param object The object to test.
     */
    isValid(object: Moment): boolean {
        return isMoment(object);
    }

    /**
     * Returns the total number of days in the temporal object.
     * Note: It does not include the number of months. Ex. If the object has
     * a month, 3 days and 5 hours, it will return 3.
     * @param object The temporal object from which we get the number of days.
     */
    asDays(object: Moment): number {
        return object && this.isValid(object) ? object.date() : 0;
    }

    /**
     * Returns the exact number of hours in the temporal object. This number
     * is an integer. Note: It only considers the hour part of the object.
     * Ex. If the object has a day, 5 hours and 10 minutes, it will return 5.
     * @param object The temporal object from which we get the number of hours.
     */
    getHours(object: Moment): number {
        return object && this.isValid(object) ? object.hours() : 0;
    }

    /**
     * Returns the exact number of minutes in the temporal object. This number
     * is an integer. Note: It only considers the minute part of the object.
     * Ex. If the object has an hour, 10 minutes and 41 seconds, it will return 10.
     * @param object The temporal object from which we get the number of hours.
     */
    getMinutes(object: Moment): number {
        return object && this.isValid(object) ? object.minutes() : 0;
    }

    getMaxTimeInMinutes(object: Moment, withDays: boolean): number {
        if (object && this.isValid(object)) {
            const maxDaysInMinutes = withDays ? object.daysInMonth() * this.NUMBER_OF_MINUTES_IN_DAY : 0;
            const maxHoursInMinutes = 23 * this.NUMBER_OF_MINUTES_IN_HOUR;
            const maxMinutes = 59;

            return maxDaysInMinutes + maxHoursInMinutes + maxMinutes;
        }

        return 0;
    }
}
