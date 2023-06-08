import { Observable } from 'rxjs';

import { SuggestTerm } from 'ish-core/models/suggest-term/suggest-term.model';

export interface SuggestServiceClass {
  search(searchTerm: string): Observable<SuggestTerm[]>;
}
