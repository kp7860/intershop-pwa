import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentInstrument } from '@intershop-pwa/checkout/payment/payment-method-base/models/payment-instrument.model';
import { PaymentMethod } from '@intershop-pwa/checkout/payment/payment-method-base/models/payment-method.model';
import { TranslateModule } from '@ngx-translate/core';
import { instance, mock } from 'ts-mockito';

import { CheckoutFacade } from 'ish-core/facades/checkout.facade';
import { FormlyTestingModule } from 'ish-shared/formly/dev/testing/formly-testing.module';

import { PaymentConcardisCreditcardCvcDetailComponent } from './payment-concardis-creditcard-cvc-detail.component';

describe('Payment Concardis Creditcard Cvc Detail Component', () => {
  let component: PaymentConcardisCreditcardCvcDetailComponent;
  let fixture: ComponentFixture<PaymentConcardisCreditcardCvcDetailComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentConcardisCreditcardCvcDetailComponent],
      imports: [FormlyTestingModule, TranslateModule.forRoot()],
      providers: [{ provide: CheckoutFacade, useFactory: () => instance(mock(CheckoutFacade)) }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentConcardisCreditcardCvcDetailComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;

    component.paymentMethod = {
      id: 'Concardis_CreditCard',
      saveAllowed: false,
      serviceId: 'Concardis_CreditCard',
    } as PaymentMethod;

    component.paymentInstrument = {
      accountIdentifier: 'VISA 4000007XXXX00031 10/23',
      id: 'UZUKgzzAppcAAAFzK9FDCMcG',
      numberOfPayments: 0,
      parameters: [
        {
          name: 'paymentInstrumentId',
          value: '****************************',
        },
        {
          name: 'cardType',
          value: 'VISA',
        },
        {
          name: 'cvcLastUpdated',
          value: '2020-04-30T13:41:45Z',
        },
        {
          name: 'token',
          value: 'payment_instrument_123',
        },
      ],
      paymentMethod: 'Concardis_CreditCard',
      urn: 'urn:payment-instrument:basket:_3oKgzzAfGgAAAFzuFpDCMcE:UZUKgzzAppcAAAFzK9FDCMcG',
    } as PaymentInstrument;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(component.cvcDetailForm.get('cvcDetail')).toBeTruthy();
  });

  it('should return true when cvc is expired', () => {
    expect(component.isCvcExpired()).toBeTruthy();
  });

  it('should return false when cvc is valid', () => {
    component.validityTimeInMinutes = '20';
    component.paymentInstrument.parameters.find(attribute => attribute.name === 'cvcLastUpdated').value =
      new Date().toISOString();
    expect(component.isCvcExpired()).toBeFalsy();
  });

  it('should show an error if submit call back returns with an error', () => {
    const errorMessage = 'field is required';

    fixture.detectChanges();
    component.submitCallback({
      message: { properties: [{ key: 'verification', code: 123, message: errorMessage, messageKey: '' }] },
    });

    expect(component.errorMessage.cvc.message).toEqual(errorMessage);
  });
});
