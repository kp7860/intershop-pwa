import { Component, Input } from '@angular/core';
import { Product } from '../../../../models/product/product.model';

@Component({
  selector: 'ish-recently-viewed',
  templateUrl: './recently-viewed.component.html'
})

export class RecentlyViewedComponent {

  @Input() products: Product[];

}
