import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { routerNavigatedAction } from '@ngrx/router-store';
import { Store, select } from '@ngrx/store';
import { MatomoTracker } from '@ngx-matomo/tracker';
import { EMPTY, from, iif, of } from 'rxjs';
import {
  concatMap,
  filter,
  map,
  mergeMap,
  shareReplay,
  startWith,
  switchMap,
  take,
  withLatestFrom,
} from 'rxjs/operators';

import { Basket } from 'ish-core/models/basket/basket.model';
import { BasketService } from 'ish-core/services/basket/basket.service';
import { getCurrentCurrency } from 'ish-core/store/core/configuration';
import { mapToRouterState } from 'ish-core/store/core/router';
import { resetOrderErrors } from 'ish-core/store/customer/orders';
import { getLoggedInCustomer, loginUserSuccess } from 'ish-core/store/customer/user';
import { ApiTokenService } from 'ish-core/utils/api-token/api-token.service';
import { mapErrorToAction, mapToPayloadProperty, mapToProperty } from 'ish-core/utils/operators';

import {
  createBasket,
  createBasketFail,
  createBasketSuccess,
  deleteBasketAttribute,
  deleteBasketAttributeFail,
  deleteBasketAttributeSuccess,
  loadBasket,
  loadBasketByAPIToken,
  loadBasketEligibleShippingMethods,
  loadBasketEligibleShippingMethodsFail,
  loadBasketEligibleShippingMethodsSuccess,
  loadBasketFail,
  loadBasketSuccess,
  loadBasketWithId,
  mergeBasketFail,
  mergeBasketInProgress,
  mergeBasketSuccess,
  resetBasketErrors,
  setBasketAttribute,
  setBasketAttributeFail,
  setBasketAttributeSuccess,
  submitBasket,
  submitBasketFail,
  submitBasketSuccess,
  updateBasket,
  updateBasketCostCenter,
  updateBasketFail,
  updateBasketShippingMethod,
} from './basket.actions';
import { getCurrentBasket, getCurrentBasketId } from './basket.selectors';

@Injectable()
export class BasketEffects {
  constructor(
    private actions$: Actions,
    private basketService: BasketService,
    private apiTokenService: ApiTokenService,
    private router: Router,
    private store: Store,
    @Inject(PLATFORM_ID) private platformId: string,
    private readonly tracker: MatomoTracker
  ) {}

  /**
   * The load basket effect.
   */
  loadBasket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadBasket),
      mergeMap(() =>
        isPlatformBrowser(this.platformId) && window.sessionStorage.getItem('basket-id')
          ? of(loadBasketWithId({ basketId: window.sessionStorage.getItem('basket-id') }))
          : this.basketService.getBasket().pipe(
              map(basket => loadBasketSuccess({ basket })),
              mapErrorToAction(loadBasketFail)
            )
      )
    )
  );

  /**
   * Loads a basket with the given id.
   */
  loadBasketWithId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadBasketWithId),
      mapToPayloadProperty('basketId'),
      mergeMap(basketId =>
        this.basketService.getBasketWithId(basketId).pipe(
          map(basket => loadBasketSuccess({ basket })),
          mapErrorToAction(loadBasketFail)
        )
      )
    )
  );

  /**
   * Loads the current basket for a user authenticated by apiToken.
   */
  loadBasketByAPIToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadBasketByAPIToken),
      mapToPayloadProperty('apiToken'),
      concatMap(apiToken =>
        this.basketService.getBasketByToken(apiToken).pipe(map(basket => loadBasketSuccess({ basket })))
      )
    )
  );

  /**
   * Recalculate basket if the basket currency doesn't match the current currency.
   */
  recalculateBasketAfterCurrencyChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadBasketSuccess),
      mapToPayloadProperty('basket'),
      withLatestFrom(this.store.select(getCurrentCurrency)),
      filter(([basket, currency]) => basket.purchaseCurrency !== currency),
      take(1),
      map(() => updateBasket({ update: { calculated: true } }))
    )
  );

  /**
   * Creates a basket that is used for all subsequent basket operations with a fixed basket id instead of 'current'.
   */
  createBasket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createBasket),
      mergeMap(() =>
        this.basketService.createBasket().pipe(
          map(basket => createBasketSuccess({ basket })),
          mapErrorToAction(createBasketFail)
        )
      )
    )
  );

  /**
   * The load basket eligible shipping methods effect.
   */
  loadBasketEligibleShippingMethods$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadBasketEligibleShippingMethods),
      withLatestFrom(this.store.pipe(select(getCurrentBasket))),
      concatMap(([, basket]) =>
        this.basketService.getBasketEligibleShippingMethods(basket.bucketId).pipe(
          map(result => loadBasketEligibleShippingMethodsSuccess({ shippingMethods: result })),
          mapErrorToAction(loadBasketEligibleShippingMethodsFail)
        )
      )
    )
  );

  /**
   * Update basket effect.
   */
  updateBasket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateBasket),
      mapToPayloadProperty('update'),
      concatMap(update =>
        this.basketService.updateBasket(update).pipe(
          concatMap(basket => [loadBasketSuccess({ basket }), resetBasketErrors()]),
          mapErrorToAction(updateBasketFail)
        )
      )
    )
  );

  /**
   * Updates the common shipping method of the basket.
   * Works currently only if the basket has one bucket
   */
  updateBasketShippingMethod$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateBasketShippingMethod),
      mapToPayloadProperty('shippingId'),
      map(commonShippingMethod => updateBasket({ update: { commonShippingMethod } }))
    )
  );

  /**
   * Sets a cost center at the current basket.
   */
  updateBasketCostCenter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateBasketCostCenter),
      mapToPayloadProperty('costCenter'),
      map(costCenter => updateBasket({ update: { costCenter } }))
    )
  );

  /**
   * Add or update an attribute at the basket.
   */
  setCustomAttributeToBasket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setBasketAttribute),
      mapToPayloadProperty('attribute'),
      withLatestFrom(this.store.pipe(select(getCurrentBasket))),
      mergeMap(([attr, basket]) =>
        (this.basketContainsAttribute(basket, attr.name)
          ? this.basketService.updateBasketAttribute(attr)
          : this.basketService.createBasketAttribute(attr)
        ).pipe(
          mergeMap(() => [setBasketAttributeSuccess(), loadBasket()]),
          mapErrorToAction(setBasketAttributeFail)
        )
      )
    )
  );

  /**
   * Delete an attribute from the basket. If the attribute doesn't exist, ignore it and return with the success action.
   */
  deleteCustomAttributeFromBasket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteBasketAttribute),
      mapToPayloadProperty('attributeName'),
      withLatestFrom(this.store.pipe(select(getCurrentBasket))),
      mergeMap(([name, basket]) =>
        this.basketContainsAttribute(basket, name)
          ? this.basketService.deleteBasketAttribute(name).pipe(
              mergeMap(() => [deleteBasketAttributeSuccess(), loadBasket()]),
              mapErrorToAction(deleteBasketAttributeFail)
            )
          : [deleteBasketAttributeSuccess()]
      )
    )
  );

  /**
   * dummy effect keeping the anonymous basket with the corresponding apiToken for the basket merge call
   */
  private anonymousBasket$ = createEffect(
    () =>
      this.store.pipe(
        // track basket changes
        select(getCurrentBasket),
        mapToProperty('id'),
        // append corresponding apiToken and customer
        withLatestFrom(this.apiTokenService.apiToken$, this.store.pipe(select(getLoggedInCustomer))),
        // don't emit when there is a customer
        filter(([, , customer]) => !customer),
        startWith([]),
        shareReplay(1)
      ),
    { dispatch: false }
  );

  /**
   * loading and handling merges of the users baskets, when the user logs in
   */
  loadOrMergeBasketAfterLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginUserSuccess),
      withLatestFrom(this.anonymousBasket$),
      switchMap(([, [sourceBasketId, sourceApiToken]]) =>
        this.basketService.getBaskets().pipe(
          switchMap(baskets => {
            if (sourceBasketId) {
              // anonymous basket exists -> get or create user basket and merge anonymous basket into it
              return iif(
                () => !!baskets.length,
                this.basketService.getBasketWithId('current'),
                this.basketService.createBasket()
              ).pipe(
                switchMap(newOrCurrentUserBasket =>
                  this.basketService
                    .mergeBasket(sourceBasketId, sourceApiToken, newOrCurrentUserBasket.id)
                    .pipe(map(basket => mergeBasketSuccess({ basket })))
                ),
                mapErrorToAction(mergeBasketFail),
                startWith(mergeBasketInProgress())
              );
            } else if (baskets.length) {
              // no anonymous basket exists and user already has a basket -> load it
              return of(loadBasket());
            } else {
              // no anonymous or user basket -> do nothing
              return EMPTY;
            }
          })
        )
      )
    )
  );

  /**
   * Trigger ResetBasketErrors after the user navigated to another basket/checkout route
   * Add queryParam error=true to the route to prevent resetting errors.
   *
   */
  routeListenerForResettingBasketErrors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction),
      mapToRouterState(),
      filter(routerState => /^\/(basket|checkout.*)/.test(routerState.url) && !routerState.queryParams?.error),
      mergeMap(() => [resetBasketErrors(), resetOrderErrors()])
    )
  );

  /**
   * Creates a requisition based on the given basket, if approval is required
   */
  createRequisition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(submitBasket),
      withLatestFrom(this.store.select(getCurrentBasketId)),
      concatMap(([, basketId]) =>
        this.basketService.createRequisition(basketId).pipe(
          mergeMap(() => from(this.router.navigate(['/checkout/receipt'])).pipe(map(() => submitBasketSuccess()))),
          mapErrorToAction(submitBasketFail)
        )
      )
    )
  );

  /** check whether a specific custom attribute exists at basket.
   *
   * @param basket
   * @param attributeName
   */
  private basketContainsAttribute(basket: Basket, attributeName: string): boolean {
    return !!basket?.attributes?.find(attr => attr.name === attributeName);
  }
}
