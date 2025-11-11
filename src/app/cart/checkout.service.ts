import { Injectable } from '@angular/core';
import { CartService } from './cart.service';
import { ProductsService } from '../products/products.service';
import { Observable, map, switchMap, catchError, of } from 'rxjs';
import { ProductCheckout } from '../products/product.interface';
import { ApiService } from '../core/api.service';
import {
  CheckoutRequest,
  CheckoutResponse,
  Order,
  OrderAddress,
} from './cart-api.interface';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService extends ApiService {
  constructor(
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
  ) {
    super();
  }

  getProductsForCheckout(): Observable<ProductCheckout[]> {
    // First load cart from API
    return this.cartService.loadCart().pipe(
      switchMap(() => {
        const cart = this.cartService.cart();
        const productIds = Object.keys(cart);

        if (productIds.length === 0) {
          return of([]);
        }

        return this.productsService.getProductsForCheckout(productIds).pipe(
          map((products) =>
            products.map((product) => ({
              ...product,
              orderedCount: cart[product.id],
              totalPrice: +(cart[product.id] * product.price).toFixed(2),
            })),
          ),
        );
      }),
    );
  }

  /**
   * Create an order from the current cart
   */
  checkout(address: OrderAddress): Observable<CheckoutResponse> {
    if (!this.endpointEnabled('cart')) {
      return of({
        order: {
          id: 'mock-order-id',
          userId: 'mock-user-id',
          cartId: 'mock-cart-id',
          items: [],
          address,
          total: 0,
        },
      });
    }

    const url = this.getUrl('cart', '/api/profile/cart/order');
    const request: CheckoutRequest = { address };

    return this.http.put<CheckoutResponse>(url, request).pipe(
      catchError((error) => {
        console.error('Error creating order:', error);
        throw error;
      }),
    );
  }

  /**
   * Get all orders for the current user
   */
  getOrders(): Observable<Order[]> {
    if (!this.endpointEnabled('cart')) {
      return of([]);
    }

    const url = this.getUrl('cart', '/api/profile/cart/order');
    return this.http.get<Order[]>(url).pipe(
      catchError((error) => {
        console.error('Error fetching orders:', error);
        return of([]);
      }),
    );
  }
}
