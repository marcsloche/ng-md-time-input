import { Directive, OnInit, ElementRef, HostListener, Input } from '@angular/core';
import { BACKSPACE, CONTROL, LEFT_ARROW, DOWN_ARROW, RIGHT_ARROW, UP_ARROW, TAB, F1, F12 } from '@angular/cdk/keycodes';

@Directive({
  selector: '[ng-md-only-number]'
})
export class OnlyNumberDirective {
  regexStr = '^[-]?[0-9]+$';


  private oldValue: number;

  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<number> = [BACKSPACE, CONTROL, LEFT_ARROW, DOWN_ARROW, RIGHT_ARROW, UP_ARROW, TAB];

  constructor(private el: ElementRef) { }

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    const carretPosition = this.el.nativeElement.selectionStart;
    const currentValue = this.el.nativeElement.value;

    this.oldValue = this.el.nativeElement.value;

    if (this.isSpecialKey(event)) {
      return;
    }

    const regEx = new RegExp(this.regexStr);
    const newValue = currentValue.substr(0, carretPosition) + event.key + currentValue.substr(carretPosition);

    if (!regEx.test(newValue)) {
      // prevent the event from hapenning
      event.preventDefault();
    }
  }

  private isSpecialKey(event: KeyboardEvent): boolean {
    return this.specialKeys.indexOf(event.keyCode) !== -1 || event.ctrlKey || (event.keyCode >= F1 && event.keyCode <= F12);
  }
}
