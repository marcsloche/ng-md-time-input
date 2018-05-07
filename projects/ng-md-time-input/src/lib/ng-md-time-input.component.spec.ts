import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed, } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NgMdTimeInputComponent } from './ng-md-time-input.component';
import { NgMdTimeInputModule } from './ng-md-time-input.module';
import { utc } from 'moment';

describe('NgMdTimeInputComponent', () => {
  const HOURS_DECIMAL_INPUT_NAME = "hoursDecimal";
  const HOURS_UNIT_INPUT_NAME = "hoursUnit";
  const MINUTES_DECIMAL_INPUT_NAME = "minutesDecimal";
  const MINUTES_UNIT_INPUT_NAME = "minutesUnit";
  // The ids are the same but I created other variables for them in order to maintain the tests more easily.
  const HOURS_DECIMAL_INPUT_ID = "hoursDecimal";
  const HOURS_UNIT_INPUT_ID = "hoursUnit";
  const MINUTES_DECIMAL_INPUT_ID = "minutesDecimal";
  const MINUTES_UNIT_INPUT_ID = "minutesUnit";

  const DISPLAYED_TIME_FORMAT = "HH:mm";

  let component: NgMdTimeInputComponent;
  let fixture: ComponentFixture<NgMdTimeInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgMdTimeInputModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgMdTimeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display current date when set to the current date via NgModel', () => {
    const currentTime = utc();
    // Setting up the time via the NgModel entry point in the component.
    component.writeValue(currentTime);
    fixture.detectChanges();
    const displayedTime = getDisplayedTime();
    expect(displayedTime).toEqual(currentTime.format(DISPLAYED_TIME_FORMAT));
  });

  it('should display the given time when it is not the current time', () => {
    const currentTime = utc("23:59", "HH:mm");
    // Setting up the time via the NgModel entry point in the component.
    component.writeValue(currentTime);
    fixture.detectChanges();
    const displayedTime = getDisplayedTime();
    expect(displayedTime).toEqual(currentTime.format(DISPLAYED_TIME_FORMAT));
  });

  it('should contain the given time', () => {
    const currentTime = utc("23:59", "HH:mm");
    // Setting up the time via the NgModel entry point in the component.
    component.writeValue(currentTime);
    fixture.detectChanges();
    const timeInComponent = component.time;
    expect(currentTime.isSame(timeInComponent)).toBeTruthy();
  });

  describe('Keyboard events', () => {
    it('should increment minutes unit by 1 but should not change date', () => {
      const currentTime = utc("23:59", "HH:mm");
      const expectedTime = currentTime.clone().add(1, "minute").subtract(1, 'day'); // Set time back to 00:00 the current day.
      // Setting up the time via the NgModel entry point in the component.
      component.writeValue(currentTime);
      fixture.detectChanges();
      // Incrementing the value
      const event = new KeyboardEvent("keydown", {
        key: 'ArrowUp',
      });
      getInput(MINUTES_UNIT_INPUT_ID).dispatchEvent(event);

      expect(expectedTime.isSame(component.time)).toBeTruthy("Time in component was not incremented properly. Value: " + component.time.format("L HH:mm") + ", Expected: " + expectedTime.format("L HH:mm"));
    });

    it('should decrement minutes unit by 1 but should not change date', () => {
      const currentTime = utc("00:00", "HH:mm");
      const expectedTime = currentTime.clone().subtract(1, "minute").add(1, 'day'); // Set time back to 23:59 the current day.
      // Setting up the time via the NgModel entry point in the component.
      component.writeValue(currentTime);
      fixture.detectChanges();
      // Decrementing the value
      const event = new KeyboardEvent("keydown", {
        key: 'ArrowDown',
      });
      getInput(MINUTES_UNIT_INPUT_ID).dispatchEvent(event);

      expect(expectedTime.isSame(component.time)).toBeTruthy("Time in component was not decremented properly. Value: " + component.time.format("L HH:mm") + ", Expected: " + expectedTime.format("L HH:mm"));
    });

    it('should increment minutes decimal by 1 but should not change date', () => {
      const currentTime = utc("23:59", "HH:mm");
      const expectedTime = currentTime.clone().add(10, "minute").subtract(1, 'day'); // Set time back to 00:09 the current day.
      // Setting up the time via the NgModel entry point in the component.
      component.writeValue(currentTime);
      fixture.detectChanges();
      // Incrementing the value
      const event = new KeyboardEvent("keydown", {
        key: 'ArrowUp',
      });
      getInput(MINUTES_DECIMAL_INPUT_ID).dispatchEvent(event);

      expect(expectedTime.isSame(component.time)).toBeTruthy("Time in component was not incremented properly. Value: " + component.time.format("L HH:mm") + ", Expected: " + expectedTime.format("L HH:mm"));
    });

    it('should decrement minutes decimal by 1 but should not change date', () => {
      const currentTime = utc("00:00", "HH:mm");
      const expectedTime = currentTime.clone().subtract(10, "minute").add(1, 'day'); // Set time back to 23:50 the current day.
      // Setting up the time via the NgModel entry point in the component.
      component.writeValue(currentTime);
      fixture.detectChanges();
      // Decrementing the value
      const event = new KeyboardEvent("keydown", {
        key: 'ArrowDown',
      });
      getInput(MINUTES_DECIMAL_INPUT_ID).dispatchEvent(event);

      expect(expectedTime.isSame(component.time)).toBeTruthy("Time in component was not decremented properly. Value: " + component.time.format("L HH:mm") + ", Expected: " + expectedTime.format("L HH:mm"));
    });

    it('should increment hours unit by 1 but should not change date', () => {
      const currentTime = utc("23:59", "HH:mm");
      const expectedTime = currentTime.clone().add(1, "hour").subtract(1, 'day'); // Set time back to 00:59 the current day.
      // Setting up the time via the NgModel entry point in the component.
      component.writeValue(currentTime);
      fixture.detectChanges();
      // Incrementing the value
      const event = new KeyboardEvent("keydown", {
        key: 'ArrowUp',
      });
      getInput(HOURS_UNIT_INPUT_ID).dispatchEvent(event);

      expect(expectedTime.isSame(component.time)).toBeTruthy("Time in component was not incremented properly. Value: " + component.time.format("L HH:mm") + ", Expected: " + expectedTime.format("L HH:mm"));
    });

    it('should decrement hours unit by 1 but should not change date', () => {
      const currentTime = utc("00:00", "HH:mm");
      const expectedTime = currentTime.clone().subtract(1, "hour").add(1, 'day'); // Set time back to 23:00 the current day.
      // Setting up the time via the NgModel entry point in the component.
      component.writeValue(currentTime);
      fixture.detectChanges();
      // Decrementing the value
      const event = new KeyboardEvent("keydown", {
        key: 'ArrowDown',
      });
      getInput(HOURS_UNIT_INPUT_ID).dispatchEvent(event);

      expect(expectedTime.isSame(component.time)).toBeTruthy("Time in component was not decremented properly. Value: " + component.time.format("L HH:mm") + ", Expected: " + expectedTime.format("L HH:mm"));
    });

    it('should add 10 hours when the user increments the hours decimal field but should not change date', () => {
      const currentTime = utc("23:59", "HH:mm");
      const expectedTime = currentTime.clone().add(10, "hour").subtract(1, 'day'); // Set time back to 09:59 the current day.
      // Setting up the time via the NgModel entry point in the component.
      component.writeValue(currentTime);
      fixture.detectChanges();
      // Incrementing the value
      const event = new KeyboardEvent("keydown", {
        key: 'ArrowUp',
      });
      getInput(HOURS_DECIMAL_INPUT_ID).dispatchEvent(event);

      expect(expectedTime.isSame(component.time)).toBeTruthy("Time in component was not incremented properly. Value: " + component.time.format("L HH:mm") + ", Expected: " + expectedTime.format("L HH:mm"));
    });

    it('should substract 10 hours when the user decrements the hours decimal field but should not change date', () => {
      const currentTime = utc("00:00", "HH:mm");
      const expectedTime = currentTime.clone().subtract(10, "hour").add(1, 'day'); // Set time back to 14:00 the current day.
      // Setting up the time via the NgModel entry point in the component.
      component.writeValue(currentTime);
      fixture.detectChanges();
      // Decrementing the value
      const event = new KeyboardEvent("keydown", {
        key: 'ArrowDown',
      });
      getInput(HOURS_DECIMAL_INPUT_ID).dispatchEvent(event);

      expect(expectedTime.isSame(component.time)).toBeTruthy("Time in component was not decremented properly. Value: " + component.time.format("L HH:mm") + ", Expected: " + expectedTime.format("L HH:mm"));
    });
  });

/*   describe("Focus and carret management", () => {
    it("should focus by default to the rightmost input when the user clicks on the field and label is not floating.", () => {
      const rightMostInput = getInput(MINUTES_UNIT_INPUT_ID);

      // After getting the rightmost input, we need to trigger a click on the component.
      fixture.nativeElement.click();
      fixture.detectChanges();
      const focusedElement = document.activeElement;

      expect(focusedElement).toBeTruthy();
      expect(focusedElement.id).toEqual(rightMostInput.id);
    });
  }); */

  /**
   * @returns the displayed time, in the HH:mm format.
   */
  function getDisplayedTime(): string {
    const hoursDecimal = component.parts.get(HOURS_DECIMAL_INPUT_NAME).value;
    const hoursUnit = component.parts.get(HOURS_UNIT_INPUT_NAME).value;
    const minutesDecimal = component.parts.get(MINUTES_DECIMAL_INPUT_NAME).value;
    const minutesUnit = component.parts.get(MINUTES_UNIT_INPUT_NAME).value;

    return `${hoursDecimal}${hoursUnit}:${minutesDecimal}${minutesUnit}`;
  }

  function getInput(inputId: string): HTMLElement {
    return fixture.debugElement.query(By.css(`#${inputId}`)).nativeElement;
  }
});
