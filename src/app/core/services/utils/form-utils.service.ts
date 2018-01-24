import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

@Injectable()
export class FormUtilsService {

  /**
   * Marks all fields in a form group as dirty recursively (i.e. for nested form groups also)
   * @param  {FormGroup} formGroup
   * @returns  void
   */
  markAsDirtyRecursive(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      if (formGroup.controls[key] instanceof FormGroup) {
        this.markAsDirtyRecursive(formGroup.controls[key] as FormGroup);
      } else {
        formGroup.controls[key].markAsDirty();
        formGroup.controls[key].updateValueAndValidity();
      }
    });
  }

  /**
   * Updates validators for control
   * - enables required validator when there are elements in the array
   * - disables validator when no elements present
   * - resets control value to empty
   * @method updateValidatorsByDataArray
   * @param {AbstractControl} control
   * @param {any[]} array
   * @param {ValidatorFn | ValidatorFn[]} validators
   * @param {boolean} async
   * @returns void
   */
  updateValidatorsByDataLength(
    control: AbstractControl,
    array: any[],
    validators: ValidatorFn | ValidatorFn[] = Validators.required,
    async = false
  ) {
    // asyncify this if async flag is set
    if (async) {
      return this.asyncify(
        () => this.updateValidatorsByDataLength(control, array, validators, false)
      );
    }

    if (array && array.length) {
      control.setValidators(validators);
    } else {
      control.clearValidators();
    }
    control.setValue('');
    control.updateValueAndValidity();
  }

  /**
   * Calls a function asynchronously
   * @method asyncify
   * @param {Function} fn
   * @returns void
   */
  asyncify(fn: Function) {
    setTimeout(fn, 0);
    return;
  }

  arrayDiff(a: any[], b: any[]): any[] {
    return a.filter(i => !b.includes(i));
  }

  arrayIntersect(a: any[], b: any[]): any[] {
    return a.filter(i => b.includes(i));
  }

}

