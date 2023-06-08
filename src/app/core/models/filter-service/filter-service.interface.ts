import { Observable } from 'rxjs';

import { FilterNavigation } from 'ish-core/models/filter-navigation/filter-navigation.model';
import { URLFormParams } from 'ish-core/utils/url-form-params';

export interface FilterServiceClass {
  getFilterForCategory(categoryUniqueId: string): Observable<FilterNavigation>;
  getFilterForSearch(searchTerm: string): Observable<FilterNavigation>;
  getFilterForMaster(masterSKU: string): Observable<FilterNavigation>;
  applyFilter(searchParameter: URLFormParams): Observable<FilterNavigation>;
}
