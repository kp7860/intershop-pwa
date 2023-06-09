import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { iif } from 'rxjs';
import { map, mergeMap, switchMap } from 'rxjs/operators';

import { FeatureToggleService } from 'ish-core/feature-toggle.module';
import { FilterService } from 'ish-core/services/filter/filter.service';
import { SparqueFilterService } from 'ish-core/services/sparque/sparque-filter/sparque-filter.service';
import { personalizationStatusDetermined } from 'ish-core/store/customer/user';
import { delayUntil, mapErrorToAction, mapToPayload } from 'ish-core/utils/operators';

import {
  applyFilter,
  applyFilterFail,
  applyFilterSuccess,
  loadFilterFail,
  loadFilterForCategory,
  loadFilterForMaster,
  loadFilterForSearch,
  loadFilterSuccess,
} from './filter.actions';

@Injectable()
export class FilterEffects {
  constructor(
    private actions$: Actions,
    private filterService: FilterService,
    private featureToggle: FeatureToggleService,
    private sparqueFilterService: SparqueFilterService
  ) {}

  loadAvailableFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadFilterForCategory, loadFilterForSearch, loadFilterForMaster),
      delayUntil(this.actions$.pipe(ofType(personalizationStatusDetermined))),
      map(action => {
        switch (action.type) {
          case loadFilterForCategory.type:
            return this.filterService.getFilterForCategory(action.payload.uniqueId);
          case loadFilterForSearch.type:
            return iif(
              () => this.featureToggle.enabled('sparque'),
              this.sparqueFilterService.getFilterForSearch(action.payload.searchTerm),
              this.filterService.getFilterForSearch(action.payload.searchTerm)
            );
          case loadFilterForMaster.type:
            return this.filterService.getFilterForMaster(action.payload.masterSKU);
        }
      }),
      switchMap(observable$ =>
        observable$.pipe(
          map(filterNavigation => loadFilterSuccess({ filterNavigation })),
          mapErrorToAction(loadFilterFail)
        )
      )
    )
  );

  applyFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(applyFilter),
      mapToPayload(),
      mergeMap(({ searchParameter }) =>
        iif(
          () => this.featureToggle.enabled('sparque'),
          this.sparqueFilterService.applyFilter(searchParameter),
          this.filterService.applyFilter(searchParameter)
        ).pipe(
          map(availableFilter => applyFilterSuccess({ availableFilter, searchParameter })),
          mapErrorToAction(applyFilterFail)
        )
      )
    )
  );
}
