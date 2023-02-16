import { LineItem } from 'ish-core/models/line-item/line-item.model';
import { BasketItemUpdateType } from 'ish-core/services/basket/basket.service';

import { LineItemUpdate } from './line-item-update.model';

export interface LineItemUpdateHelperItem {
  id: string;
  productSKU?: string;
  quantity?: { value: number };
}

export class LineItemUpdateHelper {
  static filterUpdatesByItems(updates: LineItemUpdate[], items: LineItemUpdateHelperItem[]): LineItemUpdate[] {
    return updates
      .reduce((acc: { item: LineItem; update: LineItemUpdate }[], update) => {
        const item = items.find(x => x.id === update.itemId);
        return item ? [...acc, { item, update }] : acc;
      }, [])
      .filter(
        ({ item, update }) =>
          // quantity changed
          (update.quantity >= 0 && item.quantity.value !== update.quantity) ||
          // sku changed
          (update.sku && update.sku !== item.productSKU)
      )
      .map(({ update }) => update);
  }

  static determineUpdateItemPayload(lineItem: LineItemUpdate): BasketItemUpdateType {
    const payload: BasketItemUpdateType = {
      quantity: lineItem.quantity > 0 ? { value: lineItem.quantity, unit: lineItem.unit } : undefined,
      product: lineItem.sku,
    };

    if (lineItem.warrantySku || lineItem.warrantySku === '')
      // eslint-disable-next-line unicorn/no-null
      return { ...payload, warranty: lineItem.warrantySku ? lineItem.warrantySku : null }; // undefined is not working here
    return payload;
  }
}
