import { BaseFilterService } from 'ish-core/services/filter/filter.service';
import { BaseProductsService } from 'ish-core/services/products/products.service';
import { BaseSuggestService } from 'ish-core/services/suggest/suggest.service';

/**
 * List with all abstract service classes
 */
export interface Services {
  suggest: BaseSuggestService;
  filter: BaseFilterService;
  products: BaseProductsService;
}

export interface ServiceSelectionConfiguration {
  serviceName: keyof Services;
  selectClass(): any;
}
