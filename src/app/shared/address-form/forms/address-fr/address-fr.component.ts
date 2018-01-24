import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'ish-address-fr',
  templateUrl: './address-fr.component.html'
})
export class AddressFRComponent implements OnInit {

  @Input() addressForm: FormGroup;
  @Input() countryCode: string;

  ngOnInit() {
    if (!this.addressForm) {
      throw new Error('required input parameter <addressForm> is missing for AddressFRComponent');
    }
  }
}
