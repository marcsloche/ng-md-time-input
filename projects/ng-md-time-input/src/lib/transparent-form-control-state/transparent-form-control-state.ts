import { NgControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
/**
 * This class replicates the state of the given form group to the given control.
 * The replication is transparent, which means that if the form group is
 * invalid, the control will be set to invalid with the same errors.
 * The same goes for other NgControl possible status.
 *
 * Only status that can be listened to through the status changed stream
 * will be synced, which means that the touched status WILL NOT be synced.
 *
 * This class acts mainly as a bridge between the NgControl and the FormGroup.
 * It exists only to easy the state management of a NgControl that implements
 * the ControlValueAccessor interface.
 */
export class TransparentFormControlState {
    private formControlRef: NgControl;
    private subscription: Subscription;

    /**
     * Keeps the NgControl's state aligned with the state of the given form.
     */
    register(form: FormGroup, formControlRef: NgControl): void {
        this.unsubscribeFromForm();

        if (form && formControlRef) {
            // Listening to the status change stream of the form.
            // If the state of the form is not aligned with the one of the NgControl.
            this.subscription = form.statusChanges.subscribe(() => {
                // The invalid state
                if (form.invalid && !formControlRef.invalid) {
                    formControlRef.control.setErrors( this.getAllErrorsOfForm(form) );
                }
                else if (!form.invalid && formControlRef.invalid) {
                    formControlRef.control.setErrors(null);
                }
            });
        }
    }

    /**
     * Frees up the resources used by this class. This is needed
     * since this class is subscribing to the form group statusChange
     * in order to sync up the control's state.
     */
    freeResources() {
        this.unsubscribeFromForm();
    }

    private getAllErrorsOfForm(form: FormGroup): any {
        let errors = null;
        if(form) {
            const keys = Object.keys(form.controls);
            for(const key of keys) {
                if(form.get(key).errors) {
                    errors = Object.assign(errors ? errors : {}, form.get(key).errors);
                }
            }
        }

        return errors;
    }

    private unsubscribeFromForm() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
