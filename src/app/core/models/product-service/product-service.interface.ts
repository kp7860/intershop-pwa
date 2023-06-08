import { Observable } from 'rxjs';

import { ProductLinksDictionary } from 'ish-core/models/product-links/product-links.model';
import { SortableAttributesType } from 'ish-core/models/product-listing/product-listing.model';
import {
  Product,
  SkuQuantityType,
  VariationProduct,
  VariationProductMaster,
} from 'ish-core/models/product/product.model';
import { URLFormParams } from 'ish-core/utils/url-form-params';

export interface ProductServiceClass {
  getProduct(sku: string): Observable<Product>;
  getCategoryProducts(
    categoryUniqueId: string,
    amount: number,
    sortKey?: string,
    offset?: number
  ): Observable<{ products: Product[]; sortableAttributes: SortableAttributesType[]; total: number }>;
  searchProducts(
    searchTerm: string,
    amount: number,
    sortKey?: string,
    offset?: number
  ): Observable<{ products: Product[]; sortableAttributes: SortableAttributesType[]; total: number }>;
  getProductsForMaster(
    masterSKU: string,
    amount: number,
    sortKey?: string,
    offset?: number
  ): Observable<{ products: Product[]; sortableAttributes: SortableAttributesType[]; total: number }>;
  getFilteredProducts(
    searchParameter: URLFormParams,
    amount: number,
    sortKey?: string,
    offset?: number
  ): Observable<{ total: number; products: Partial<Product>[]; sortableAttributes: SortableAttributesType[] }>;
  getProductVariations(sku: string): Observable<{
    products: Partial<VariationProduct>[];
    defaultVariation: string;
    masterProduct: Partial<VariationProductMaster>;
  }>;
  getProductBundles(sku: string): Observable<{ stubs: Partial<Product>[]; bundledProducts: SkuQuantityType[] }>;
  getRetailSetParts(sku: string): Observable<Partial<Product>[]>;
  getProductLinks(sku: string): Observable<ProductLinksDictionary>;
}
