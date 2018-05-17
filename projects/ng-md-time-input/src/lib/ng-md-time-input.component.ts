import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ElementRef,
    forwardRef,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Renderer2,
    Self,
    ViewChild
} from "@angular/core";
import {
    ControlValueAccessor,
    FormBuilder,
    FormGroup,
    NG_VALUE_ACCESSOR,
    NgControl,
    Validators,
    AbstractControl,
    Validator,
    ValidatorFn
} from "@angular/forms";
import { MatFormFieldControl } from "@angular/material";
import { FocusMonitor, FocusOrigin } from "@angular/cdk/a11y";
import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { Subject, Subscription } from "rxjs";
// Moment
import { Duration, duration, isDuration } from "moment";
// Others
import { TimeFactoryService } from './time-factory.service';


@Component({
    selector: 'ng-md-time-input',
    templateUrl: "./ng-md-time-input.component.html",
    styleUrls: ["./ng-md-time-input.component.css"],
    providers: [
        { provide: MatFormFieldControl, useExisting: NgMdTimeInputComponent },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgMdTimeInputComponent implements OnInit, OnDestroy, MatFormFieldControl<Duration>, ControlValueAccessor {
    static nextId = 0;
    // Inputs and Outputs
    @Input() daysSeparator = "d";
    @Input() hoursSeparator = ":";
    @Input() minutesSeparator = "";
    @Input() showDays = true;
    // Time management
    time: Duration;
    private readonly MINUTES_UNIT_INCREMENT_STEP = 1;
    private readonly NUMBER_OF_MINUTES_IN_TEN_MINUTES = 10;
    private readonly NUMBER_OF_MINUTES_IN_HOUR = 60;
    private readonly NUMBER_OF_MINUTES_IN_TEN_HOURS = 600;
    private readonly NUMBER_OF_MINUTES_IN_DAY = 1440;
    private readonly NUMBER_OF_MINUTES_IN_TEN_DAYS = 14400;
    private readonly MAX_TIME_IN_MINUTES = 143999; // 99d 23:59
    // Form element management
    private _preventFocusLoss = false;
    private subscriptions: Subscription[] = [];
    stateChanges = new Subject<void>();
    @ViewChild("minutesUnit") minutesUnit: ElementRef;
    @ViewChild("minutesDecimal") minutesDecimal: ElementRef;
    @ViewChild("hoursUnit") hoursUnit: ElementRef;
    @ViewChild("hoursDecimal") hoursDecimal: ElementRef;
    @ViewChild("daysUnit") daysUnit: ElementRef;
    @ViewChild("daysDecimal") daysDecimal: ElementRef;
    // For the change event
    private previousDuration: Duration = null;
    private shouldManuallyTriggerChangeEvent: boolean;
    //////////////////////////////////////////////////////////////////
    // For Mat Form Field
    // Used by Angular Material to map hints and errors to the control.
    @HostBinding() id = `time-input-${NgMdTimeInputComponent.nextId++}`;
    // Used by Angular Material to bind Aria ids to our control
    @HostBinding("attr.aria-describedby") describedBy = "";

    parts: FormGroup;
    private _placeholder: string;
    focused = false;
    private _required = false;
    private _disabled = false;
    errorState = false; // By default the input is valid.
    controlType = "time-input"; // Class identifier for this control will be mat-form-field-time-input.

    // NgModel
    propagateChange = (_: any) => { };
    propagateTouched = () => { };

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private elRef: ElementRef,
        fb: FormBuilder,
        private fm: FocusMonitor,
        @Optional() @Self() public ngControl: NgControl,
        private _renderer: Renderer2,
        private timeFactoryService: TimeFactoryService) {

        // Form initialization. On top of a directive that prevents the input of non
        // numerical char, we add a pattern to assure that only numbers are allowed.
        this.parts = fb.group({
            daysDecimal: ["", Validators.pattern(/[0-9]/)],
            daysUnit: ["", Validators.pattern(/[0-9]/)],
            hoursDecimal: ["", Validators.pattern(/[0-9]/)],
            hoursUnit: ["", Validators.pattern(/[0-9]/)],
            minutesDecimal: ["", Validators.pattern(/[0-9]/)],
            minutesUnit: ["", this.getMinutesUnitValidator()]
        });

        // Subscribing to the form's status change in order to sync up the state of the NgControl with
        // the one of the form.
        this.subscriptions.push(
            this.parts.statusChanges.subscribe(() => this.handleFormStatusChange())
        );

        // Monitoring the focus in the time input.
        fm.monitor(elRef.nativeElement, true).subscribe(origin => this.handleFocusChange(origin));

        if (this.ngControl != null) {
            this.ngControl.valueAccessor = this;
        }
    }

    ngOnInit() {
        this.elRef.nativeElement.addEventListener("change", () => {
            this.shouldManuallyTriggerChangeEvent = false;
        });
    }

    ngOnDestroy() {
        // Cleaning up resources.
        this.stateChanges.complete();
        this.fm.stopMonitoring(this.elRef.nativeElement);
        for (const sub of this.subscriptions) {
            sub.unsubscribe();
        }
    }

    // This is where the NgModel with update our time.
    @Input()
    get value(): Duration | null {
        return this.time;
    }
    set value(time: Duration | null) {
        if (time && isDuration(time)) {
            this.time = time.clone();
        } else {
            this.time = null;
        }
        // Sets the time to display in the proper format.
        this.formatDislayedTime();

        this.emitChanges();
        this.shouldManuallyTriggerChangeEvent = false;
    }

    /**
     * Gets the string representation of the displayed time.
     */
    private getDisplayedTime(): string {
        return this.displayedDays + this.displayedHours + this.displayedMinutes;
    }

    /**
     * Sets the displayed days to the given value.
     * Note: This affectation will not change the ngModel value.
     */
    set displayedDays(days: string) {
        this.parts.get('daysDecimal').setValue(days.charAt(days.length - 2));
        this.parts.get('daysUnit').setValue(days.charAt(days.length - 1));
    }
    get displayedDays(): string {
        return this.parts.get('daysDecimal').value + this.parts.get('daysUnit').value;
    }

    /**
     * Sets the displayed hours to the given value.
     * Note: This affectation will not change the ngModel value.
     */
    set displayedHours(hours: string) {
        this.parts.get('hoursDecimal').setValue(hours.charAt(hours.length - 2));
        this.parts.get('hoursUnit').setValue(hours.charAt(hours.length - 1));
    }
    get displayedHours(): string {
        return this.parts.get('hoursDecimal').value + this.parts.get('hoursUnit').value;
    }

    /**
     * Sets the displayed minutes to the given value.
     * Note: This affectation will not change the ngModel value.
     */
    set displayedMinutes(minutes: string) {
        this.parts.get('minutesDecimal').setValue(minutes.charAt(minutes.length - 2));
        this.parts.get('minutesUnit').setValue(minutes.charAt(minutes.length - 1));
    }
    get displayedMinutes(): string {
        return this.parts.get('minutesDecimal').value + this.parts.get('minutesUnit').value;
    }

    ////////////////////////////////////////////////////////////////////////////
    // Time management
    /**
     * Updates both the ngModel time and the displayed time of the control with the values
     * currently displayed in the time input.
     */
    updateTime(): void {
        this.updateDisplayedTime();
        this.setTimeFromString(this.displayedDays, this.displayedHours, this.displayedMinutes);
    }

    /**
     * Updates the time displayed in the time input. This function does not change the NgModel.
     */
    updateDisplayedTime(): void {
        let displayedTime = this.getDisplayedTime();
        displayedTime = displayedTime.slice(-6); // Take only the last 6 characters for our time. (The max is 6 digits)

        this.displayedMinutes = displayedTime.slice(-2); // Take only the last two characters.
        this.displayedHours = displayedTime.slice(-4, -2); // Takes from the fourth character starting from the end to the second.
        this.displayedDays = displayedTime.slice(0, -4); // Take all characters but the last four.
    }

    /**
     * Converts a time string into a proper time format. It also set the ngModel time to the converted value.
     * @param daysString The days to set. The maximum day allowed is 99.
     * @param hoursString The hours to set. The hours will be converted to a 24 hours format. This means that
     *                    if the given hour is 25, the displayed hours will be 1.
     * @param minutesString The minutes to set. The minutes will be onverted to a 60 minutes format. This means
     *                      if the given minute 61, it will add an hour and set the minutes to 01.
     */
    setTimeFromString(daysString: string, hoursString: string, minutesString: string): void {
        // First of, we parse the strings to number in order to validate if they are numbers.
        let days = parseInt(daysString, 10);
        let hours = parseInt(hoursString, 10);
        let minutes = parseInt(minutesString, 10);

        // The strings can be NaN if they are empty, null, undefined or contain a letter.
        if (Number.isNaN(days) && Number.isNaN(hours) && Number.isNaN(minutes)) {
            this.time = null;
        }
        else {
            days = Number.isNaN(days) ? 0 : days;
            hours = Number.isNaN(hours) ? 0 : hours;
            minutes = Number.isNaN(minutes) ? 0 : minutes;
            this.setTimeFromMinutes(days * this.NUMBER_OF_MINUTES_IN_DAY + hours * this.NUMBER_OF_MINUTES_IN_HOUR + minutes);
        }

        this.emitChanges();
    }

    private setTimeFromMinutes(minutes: number) {
        // If the time is greater than the max time, set it to the max time.
        if (minutes > this.MAX_TIME_IN_MINUTES) {
            this.time = duration(this.MAX_TIME_IN_MINUTES, 'minutes');
        }
        // Else, if the time is negative, set it to 0.
        else if (minutes < 0) {
            this.time = duration();
        }
        else {
            this.time = duration(minutes, 'minutes');
        }
    }

    /**
     * This function takes the time and formats it to a padded format.
     * If the time is not a duration, it will set it to an empty string.
     */
    private formatDislayedTime() {
        if (!this.time || !isDuration(this.time)) {
            this.displayedDays = "";
            this.displayedHours = "";
            this.displayedMinutes = "";
        }
        // Else, update the model with the written time.
        else {
            this.displayedDays = this.padWithChar("0", Math.floor(this.time.asDays()).toString(), 2);
            this.displayedHours = this.padWithChar("0", this.time.hours().toString(), 2);
            this.displayedMinutes = this.padWithChar("0", this.time.minutes().toString(), 2);
        }
    }

    /**
     * Pads the given value with the given char. The padding is added at the beginning of the value.
     * @param char The char to use as padding. Its length must be of 1.
     * @param valueToPad The string value you want to pad.
     * @param desiredFinalLength The final desired length of the string.
     * @returns The padded representation of the given value.
     */
    private padWithChar(char: string, valueToPad: string, desiredFinalLength: number): string {
        if (!char || char.length !== 1) {
            throw new Error("[padWithChar] Cannot have multiple characters as padding. Only one is allowed.");
        }

        const paddedString = char.repeat(desiredFinalLength) + valueToPad;
        return paddedString.slice(desiredFinalLength * -1);
    }


    ////////////////////////////////////////////////////////////////////////////
    // Event handling
    private handleFocusChange(origin: FocusOrigin): void {
        const elementIsFocused = !!origin;
        // If the component just gain the focus, automatically focus the rightmost input.
        if (!this.focused && elementIsFocused) {
            this.focusLastInput(origin);
        }

        // Setting up the focused state. The element is focused when we prevent the focus loss
        // or when it is really focused.
        this.focused = this._preventFocusLoss || elementIsFocused;

        // If the component has been focused out, format the displayed time.
        if (!this.focused) {
            this.formatDislayedTime();
            if (this.ngControl) {
                this.ngControl.control.markAsTouched();
            }
            // By default, the change event is only triggered when the user types in a new value.
            // In our case, we want to trigger it when the user increments/decrements the value too.
            if (this.shouldManuallyTriggerChangeEvent) {
                const changeEvent = this.newEvent('change');
                this.elRef.nativeElement.dispatchEvent(changeEvent);
            }
        }
        // The focus loss prevention is only applied once. After that, return to normal focus management.
        this._preventFocusLoss = false;

        this.stateChanges.next();
    }

    private handleFormStatusChange() {
        if (!this.parts.invalid && this.errorState) {
            this.errorState = false;
        }
        else if (this.parts.invalid && !this.errorState) {
            this.errorState = true;
        }
    }

    /**
     * Handles the keydown event on the time input.
     * @param event The keyboard event related to the key down.
     * @param targettedInputName The form control that had the focus while the key was pressed.
     */
    handleKeydown(event: KeyboardEvent, targettedInputName: string): void {
        // On up arrow, we want to increment the targetted input
        if (event.key === 'ArrowUp') {
            const incrementStep = this.getIncrementStep(targettedInputName);
            this.incrementTime(incrementStep);
            event.preventDefault(); // Prevents the carret from moving to the lefthand of the input
            // event.stopPropagation(); // prevents the carret from moving
            return;
        }
        // On down arrow, we want to decrement the targetted input
        else if (event.key === 'ArrowDown') {
            const decrementStep = this.getDecrementStep(targettedInputName);
            this.incrementTime(decrementStep);
            event.preventDefault(); // Prevents the carret from moving to the righthand of the input
            // event.stopPropagation(); // prevents the carret from moving
            return;
        }
        // On left arrow, we want to move the carret to the left sibling of the targetted input
        else if (event.key === 'ArrowLeft') {
            const leftSibling = this.getLeftSiblingOfInput(targettedInputName);
            // The sibling can be null if the carret cannot go further to the left or
            // can be undefined if the ViewChild was not properly initialized.
            if (leftSibling && leftSibling.nativeElement.value) {
                this.keepFocus(); // Otherwise, the focus is lost momentarly
                this.focusInput(leftSibling.nativeElement, "keyboard");
            }
            event.preventDefault(); // Prevents the carret from moving to the lefthand of the input
            event.stopPropagation(); // prevents the carret from cancelling the new focus

            return;
        }
        // On right arrow, we want to move the carret to the right sibling of the targetted input
        else if (event.key === 'ArrowRight') {
            const rightSibling = this.getRightSiblingOfInput(targettedInputName);
            // The sibling can be null if the carret cannot go further to the right or
            // can be undefined if the ViewChild was not properly initialized.
            if (rightSibling && rightSibling.nativeElement.value) {
                this.keepFocus(); // Otherwise, the focus is lost momentarly
                this.focusInput(rightSibling.nativeElement, "keyboard");
            }

            event.preventDefault(); // Prevents the carret from moving to the righthand of the input
            event.stopPropagation(); // prevents the carret from cancelling the new focus
            return;
        }
    }

    /**
     * Increments the current time by the given amount of minutes.
     * @param incrementStep The increment step, in minutes.
     */
    incrementTime(incrementStep: number) {
        if (!this.time) {
            this.time = duration();
        }

        this.setTimeFromMinutes(this.time.asMinutes() + incrementStep);

        // Once the ngModel is updated, update the displayed time.
        this.formatDislayedTime();
        this.emitChanges();
        // Since the inputs are not recognizing the increment as an input event, we got to manually trigger one.
        const inputEvent = this.newEvent('input');
        this.elRef.nativeElement.dispatchEvent(inputEvent);
    }

    /**
     * @returns The proper increment step, based on the given input name.
     */
    private getIncrementStep(inputName: string): number {
        switch (inputName) {
            case 'daysDecimal': return this.NUMBER_OF_MINUTES_IN_TEN_DAYS;
            case 'daysUnit': return this.NUMBER_OF_MINUTES_IN_DAY;
            case 'hoursDecimal': return this.getHoursDecimalIncrementStep();
            case 'hoursUnit': return this.NUMBER_OF_MINUTES_IN_HOUR;
            case 'minutesDecimal': return this.NUMBER_OF_MINUTES_IN_TEN_MINUTES;
            case 'minutesUnit': return this.MINUTES_UNIT_INCREMENT_STEP;
        }
    }
    /**
     * @returns The proper decrement step, based on the given input name.
     */
    private getDecrementStep(inputName: string): number {
        switch (inputName) {
            case 'daysDecimal': return -1 * this.NUMBER_OF_MINUTES_IN_TEN_DAYS;
            case 'daysUnit': return -1 * this.NUMBER_OF_MINUTES_IN_DAY;
            case 'hoursDecimal': return this.getHoursDecimalDecrementStep();
            case 'hoursUnit': return -1 * this.NUMBER_OF_MINUTES_IN_HOUR;
            case 'minutesDecimal': return -1 * this.NUMBER_OF_MINUTES_IN_TEN_MINUTES;
            case 'minutesUnit': return -1 * this.MINUTES_UNIT_INCREMENT_STEP;
        }
    }

    private getHoursDecimalIncrementStep(): number {
        const currentNumberOfMinutesInTime = this.time.hours() * 60 + this.time.minutes();
        let incrementStep = this.NUMBER_OF_MINUTES_IN_TEN_HOURS;

        // The hours are on a base 24, which means that we have to adjust the increment step
        // so that the increment does not change the hours unit. (Ex: We increment the hours decimal of 0d 15:00,
        // we don't want it to display as 1d 01:00, but we want it as 1d 05:00).
        if (currentNumberOfMinutesInTime + this.NUMBER_OF_MINUTES_IN_TEN_HOURS > this.NUMBER_OF_MINUTES_IN_DAY) {
            incrementStep = ((24 - this.time.hours()) + this.time.hours() % 10) * this.NUMBER_OF_MINUTES_IN_HOUR;
        }

        return incrementStep;
    }

    private getHoursDecimalDecrementStep(): number {
        const currentNumberOfMinutesInTime = this.time.hours() * 60 + this.time.minutes();
        let decrementStep = this.NUMBER_OF_MINUTES_IN_TEN_HOURS * -1;

        // The hours are on a base 24, which means that we have to adjust the decrement step
        // so that the decrement does not change the hours unit. (Ex: We decrement the hours decimal of 1d 09:00,
        // we don't want it to display as 0d 23:00, but we want it as 0d 19:00).
        if (currentNumberOfMinutesInTime - this.NUMBER_OF_MINUTES_IN_TEN_HOURS < 0) {
            decrementStep = (this.time.hours() + (14 - this.time.hours()) % 10) * this.NUMBER_OF_MINUTES_IN_HOUR * -1;
        }

        return decrementStep;
    }

    private getLeftSiblingOfInput(inputName: string): ElementRef | null {
        switch (inputName) {
            case 'daysDecimal': return null;
            case 'daysUnit': return this.daysDecimal;
            case 'hoursDecimal': return this.daysUnit;
            case 'hoursUnit': return this.hoursDecimal;
            case 'minutesDecimal': return this.hoursUnit;
            case 'minutesUnit': return this.minutesDecimal;
        }
    }
    private getRightSiblingOfInput(inputName: string): ElementRef | null {
        switch (inputName) {
            case 'daysDecimal': return this.daysUnit;
            case 'daysUnit': return this.hoursDecimal;
            case 'hoursDecimal': return this.hoursUnit;
            case 'hoursUnit': return this.minutesDecimal;
            case 'minutesDecimal': return this.minutesUnit;
            case 'minutesUnit': return null;
        }
    }

    /**
     * Focuses the last input in the control.
     */
    focusLastInput(origin: FocusOrigin): void {
        this.focusInput(this.minutesUnit.nativeElement, origin);
    }

    private focusInput(input: HTMLElement, origin: FocusOrigin): void {
        if (input && origin) {
            this.fm.focusVia(input, origin);
        }
    }

    /**
     * This function is to fix an undesired interaction that caused the component to loose focus when the used clicks on a separator.
     */
    keepFocus() {
        this._preventFocusLoss = true;
    }

    /**
     * This function is to create an event with modern browser or old browser
     * @param type Type of event to create
     */
    private newEvent(type: string): Event {
        let changeEvent: Event;
        // Try creating a new event that is compatible with modern browsers
        try {
            changeEvent = new Event(type);
        }
        // If the browser does not support this way of creating an event (eg. IE11), do it the old way.
        catch (err) {
            changeEvent = document.createEvent(type);
        }

        return changeEvent;
    }


    ////////////////////////////////////////////////////////////////////////////
    // Validators
    private getMinutesUnitValidator(): ValidatorFn {
        const validators: ValidatorFn[] = [Validators.pattern(/[0-9]/)];

        if (this.required) {
            validators.push(Validators.required);
        }

        return Validators.compose(validators);
    }
    ////////////////////////////////////////////////////////////////////////////
    // Mat Form Field support
    @Input()
    get placeholder() {
        return this._placeholder;
    }
    set placeholder(plh) {
        this._placeholder = plh;
        this.stateChanges.next();
    }

    // This functions tells the mat-form-field wheter it is empty or not.
    get empty() {
        return !this.time || !isDuration(this.time);
    }

    // Used by Angular Material to display the label properly
    @HostBinding('class.floating')
    get shouldLabelFloat() {
        return this.focused || !this.empty;
    }

    // To handle required property on form field
    @Input()
    get required() {
        return this._required;
    }
    set required(req) {
        this._required = coerceBooleanProperty(req);
        // Updating the required status of the inputs.
        this.parts.get("minutesUnit").setValidators(this.getMinutesUnitValidator());
        this.parts.get("minutesUnit").updateValueAndValidity(); // To trigger the new validators.

        this.stateChanges.next();
    }

    // To handle disabled property on form field.
    @Input()
    get disabled() {
        return this._disabled;
    }
    set disabled(dis) {
        this._disabled = coerceBooleanProperty(dis);

        if (this._disabled) {
            this.parts.disable();
        }
        else {
            this.parts.enable();
        }

        this.stateChanges.next();
    }

    // To handle aria description
    setDescribedByIds(ids: string[]) {
        this.describedBy = ids.join(" ");
    }

    // To handle onClick event on form field container when it's not directly on an input
    onContainerClick(event: MouseEvent) {
        if ((event.target as Element).tagName.toLowerCase() !== "input") {
            this.focusLastInput("mouse");
        }
    }

    emitChanges() {
        if (this.previousDuration !== this.value) {
            this.shouldManuallyTriggerChangeEvent = true;
        }
        this.stateChanges.next();
        this.propagateChange(this.value);
        this.previousDuration = this.value;
    }

    // ----------For the ngModel two way binding -------------------------------//
    writeValue(value: Duration | null) {
        this.value = value;
    }

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    registerOnTouched(fn) {
        this.propagateTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this._renderer.setProperty(this.elRef.nativeElement, 'disabled', isDisabled);
        this.disabled = isDisabled;
    }
}
