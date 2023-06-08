import { Injectable } from '@angular/core';
import { Observable, map, switchMap, throwError } from 'rxjs';

import { SortableAttributesType } from 'ish-core/models/product-listing/product-listing.model';
import { SparqueCountResponse, SparqueFacetOptionsResponse } from 'ish-core/models/sparque/sparque.interface';
import { SparqueApiService } from 'ish-core/services/sparque/sparque-api/sparque-api.service';

@Injectable({ providedIn: 'root' })
export class SparqueProductService {
  constructor(private sparqueApiService: SparqueApiService) {}
  searchProductKeys(
    searchTerm: string,
    amount: number,
    offset?: number
  ): Observable<{ skus: string[]; sortableAttributes: SortableAttributesType[]; total: number }> {
    if (!searchTerm) {
      return throwError(() => new Error('searchProducts() called without searchTerm'));
    }

    // sortableAttributes and total are missing in REST response
    // request should wait some time to get recent basket --> could be optimized
    return this.sparqueApiService.getRelevantInformation$().pipe(
      switchMap(([basketSKUs, userId, locale]) =>
        this.sparqueApiService
          .get<[SparqueFacetOptionsResponse, SparqueCountResponse]>(
            `${SparqueApiService.getSearchPath(
              searchTerm,
              locale,
              userId,
              basketSKUs
            )}/results,count?config=default&count=${amount}&offset=${offset}`
          )
          .pipe(
            map(([result, count]) => ({
              skus: result?.items.map(item => item.tuple[0].attributes.sku),
              sortableAttributes: [],
              total: count.total,
            }))
          )
      )
    );
  }
}
