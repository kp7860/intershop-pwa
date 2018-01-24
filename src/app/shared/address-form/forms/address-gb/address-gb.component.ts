import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'ish-address-gb',
  templateUrl: './address-gb.component.html'
})
export class AddressGBComponent implements OnInit {

  @Input() addressForm: FormGroup;
  @Input() countryCode: string;

  ngOnInit() {
    if (!this.addressForm) {
      throw new Error('required input parameter <addressForm> is missing for AddressDEComponent');
    }
  }
}
