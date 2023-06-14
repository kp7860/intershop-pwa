import { Injectable, InjectionToken, Injector, inject } from '@angular/core';

import { BaseFilterService } from 'ish-core/services/filter/filter.service';
import { BaseProductsService } from 'ish-core/services/products/products.service';
import { BaseSuggestService } from 'ish-core/services/suggest/suggest.service';

export type ServiceType = 'suggest' | 'filter' | 'products';

export type ServiceClass<T extends ServiceType> = T extends 'suggest'
  ? BaseSuggestService
  : T extends 'filter'
  ? BaseFilterService
  : BaseProductsService;

export interface ServiceSelection {
  serviceName: ServiceType;
  selectClass(): any;
}
export const SERVICE_SELECTION_CONFIG = new InjectionToken<ServiceSelection>('serviceSelectionConfig');

@Injectable({ providedIn: 'root' })
export class ServiceSelectService {
  private injector = inject(Injector);

  get<T extends ServiceType, R extends ServiceClass<T>>(service: T): R {
    return this.injector
      .get<ServiceSelection[]>(SERVICE_SELECTION_CONFIG, [])
      .find(config => config.serviceName === service)
      ?.selectClass();
  }
}
