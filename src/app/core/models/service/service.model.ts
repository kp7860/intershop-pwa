import { FilterService } from 'ish-core/services/filter/filter.service';
import { ProductsService } from 'ish-core/services/products/products.service';
import { SuggestService } from 'ish-core/services/suggest/suggest.service';

/**
 * List with all abstract service classes
 */
export interface Services {
  suggest: SuggestService;
  filter: FilterService;
  products: ProductsService;
}

export interface ServiceSelectionConfiguration {
  serviceName: keyof Services;
  selectClass(): any;
}
