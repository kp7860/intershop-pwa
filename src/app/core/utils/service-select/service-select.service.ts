import { Injectable, InjectionToken, Injector, inject } from '@angular/core';

import { ServiceSelectionConfiguration, Services } from 'ish-core/models/service/service.model';
import { ReturnTypeFromKey } from 'ish-core/utils/types';

export const SERVICE_SELECTION_CONFIG = new InjectionToken<ServiceSelectionConfiguration>('serviceSelectionConfig');

/**
 * Generate type safely a correct Service Selection Configuration object
 * @param serviceName
 * @param selectClass
 * @returns
 */
export function generateServiceSelectionConfig<T extends keyof Services, R extends ReturnTypeFromKey<Services, T>>(
  serviceName: T,
  selectClass: () => R
): ServiceSelectionConfiguration {
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
      .get<ServiceSelectionConfiguration[]>(SERVICE_SELECTION_CONFIG, [])
      .find(config => config.serviceName === service)
      ?.selectClass();
  }
}
