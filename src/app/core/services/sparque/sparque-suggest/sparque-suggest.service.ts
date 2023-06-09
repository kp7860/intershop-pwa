import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SuggestTerm } from 'ish-core/models/suggest-term/suggest-term.model';
import { SparqueApiService } from 'ish-core/services/sparque/sparque-api/sparque-api.service';
import { BaseSuggestService } from 'ish-core/services/suggest/suggest.service';

@Injectable({ providedIn: 'root' })
export class SparqueSuggestService implements Partial<BaseSuggestService> {
  constructor(private sparqueApiService: SparqueApiService) {}
  search(searchTerm: string): Observable<SuggestTerm[]> {
    return this.sparqueApiService
      .get(`e/keywordsuggest/p/keyword/${searchTerm}/results`)
      .pipe(map((object: any) => object.items.map((item: any) => ({ term: item.tuple[0] }))));
  }
}
