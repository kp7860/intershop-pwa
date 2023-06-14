import { NgModule, inject } from '@angular/core';

import { FeatureToggleService } from './feature-toggle.module';
import { FilterService } from './services/filter/filter.service';
import { ProductsService } from './services/products/products.service';
import { SparqueFilterService } from './services/sparque/sparque-filter/sparque-filter.service';
import { SparqueProductService } from './services/sparque/sparque-product/sparque-product.service';
import { SparqueSuggestService } from './services/sparque/sparque-suggest/sparque-suggest.service';
import { SuggestService } from './services/suggest/suggest.service';
import { SERVICE_SELECTION_CONFIG } from './utils/service-select/service-select.service';

@NgModule({
  providers: [
    {
      provide: SERVICE_SELECTION_CONFIG,
      useFactory: () => {
        const featureService = inject(FeatureToggleService);
        const sparqueSuggest = inject(SparqueSuggestService);
        const icmSuggest = inject(SuggestService);

        return {
          serviceName: 'suggest',
          selectClass: () => (featureService.enabled('sparque') ? sparqueSuggest : icmSuggest),
        };
      },
      multi: true,
    },
    {
      provide: SERVICE_SELECTION_CONFIG,
      useFactory: () => {
        const featureService = inject(FeatureToggleService);
        const sparqueFilter = inject(SparqueFilterService);
        const icmFilter = inject(FilterService);

        return {
          serviceName: 'filter',
          selectClass: () => (featureService.enabled('sparque') ? sparqueFilter : icmFilter),
        };
      },
      multi: true,
    },
    {
      provide: SERVICE_SELECTION_CONFIG,
      useFactory: () => {
        const featureService = inject(FeatureToggleService);
        const sparqueProducts = inject(SparqueProductService);
        const icmProducts = inject(ProductsService);

        return {
          serviceName: 'products',
          selectClass: () => (featureService.enabled('sparque') ? sparqueProducts : icmProducts),
        };
      },
      multi: true,
    },
  ],
})
export class ServicesModule {}
