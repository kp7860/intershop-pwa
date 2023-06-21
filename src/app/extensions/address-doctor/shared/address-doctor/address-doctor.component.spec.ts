import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';

import { Address } from 'ish-core/models/address/address.model';
import {
  FeatureEventNotifier,
  FeatureEventService,
} from 'ish-core/utils/feature-event-notifier/feature-event-notifier.service';

import { AddressDoctorFacade } from '../../facades/address-doctor.facade';
import { AddressDoctorModalComponent } from '../address-doctor-modal/address-doctor-modal.component';

import { AddressDoctorComponent } from './address-doctor.component';

const mockAddress = {
  id: '0001"',
  urn: 'urn:address:customer:JgEKAE8BA50AAAFgDtAd1LZU:1001',
  title: 'Ms.',
  firstName: 'Patricia',
  lastName: 'Miller',
  addressLine1: 'Potsdamer Str. 20',
  postalCode: '14483',
  city: 'Berlin',
} as Address;

describe('Address Doctor Component', () => {
  let component: AddressDoctorComponent;
  let fixture: ComponentFixture<AddressDoctorComponent>;
  let element: HTMLElement;

  let featureEventService: FeatureEventService;

  beforeEach(async () => {
    featureEventService = mock(FeatureEventService);

    await TestBed.configureTestingModule({
      declarations: [MockComponent(AddressDoctorModalComponent)],
      providers: [
        { provide: AddressDoctorFacade, useFactory: () => instance(mock(AddressDoctorFacade)) },
        { provide: FeatureEventService, useFactory: () => instance(featureEventService) },
      ],
    }).compileComponents();

    when(featureEventService.eventNotifier$).thenReturn(
      of({
        id: 'custom-process-id',
        feature: 'addressDoctor',
        event: 'check-address',
        data: mockAddress,
      } as FeatureEventNotifier)
    );
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressDoctorComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
