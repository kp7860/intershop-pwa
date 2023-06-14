import { Injectable, InjectionToken, Injector, inject } from '@angular/core';

import { BaseFilterService } from 'ish-core/services/filter/filter.service';
import { BaseProductsService } from 'ish-core/services/products/products.service';
import { BaseSuggestService } from 'ish-core/services/suggest/suggest.service';

interface Services {
  suggest: BaseSuggestService;
  filter: BaseFilterService;
  products: BaseProductsService;
}

type ReturnTypeFromKey<T, K extends keyof T> = T[K];

export interface ServiceSelection {
  serviceName: keyof Services;
  selectClass(): any;
}

export const SERVICE_SELECTION_CONFIG = new InjectionToken<ServiceSelection>('serviceSelectionConfig');

export function generateServiceSelectionConfig<T extends keyof Services, R extends ReturnTypeFromKey<Services, T>>(
  serviceName: T,
  selectClass: () => R
): ServiceSelection {
  return {
    serviceName,
    selectClass,
  };
}
@Injectable({ providedIn: 'root' })
export class ServiceSelectService {
  private injector = inject(Injector);

  get<T extends keyof Services, R extends ReturnTypeFromKey<Services, T>>(service: T): R {
    return this.injector
      .get<ServiceSelection[]>(SERVICE_SELECTION_CONFIG, [])
      .find(config => config.serviceName === service)
      ?.selectClass();
  }
}
