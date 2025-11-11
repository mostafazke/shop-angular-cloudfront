import { computed, Injectable, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Observable, tap, catchError, of } from 'rxjs';
import { CartItem, UpdateCartRequest } from './cart-api.interface';
import { Product } from '../products/product.interface';

@Injectable({
  providedIn: 'root',
})
export class CartService extends ApiService {
  /** Key - item id, value - ordered amount */
  #cart = signal<Record<string, number>>({});
  #cartItems = signal<CartItem[]>([]);

  cart = this.#cart.asReadonly();
  cartItems = this.#cartItems.asReadonly();

  totalInCart = computed(() => {
    const values = Object.values(this.cart());

    if (!values.length) {
      return 0;
    }

    return values.reduce((acc, val) => acc + val, 0);
  });

  /**
   * Load cart from API
   */
  loadCart(): Observable<CartItem[]> {
    if (!this.endpointEnabled('cart')) {
      return of([]);
    }

    const url = this.getUrl('cart', '/api/profile/cart');
    return this.http.get<CartItem[]>(url).pipe(
      tap((items) => {
        this.#cartItems.set(items);
        // Update local cart state
        const cartMap: Record<string, number> = {};
        items.forEach((item) => {
          cartMap[item.product.id] = item.count;
        });
        this.#cart.set(cartMap);
      }),
      catchError((error) => {
        console.error('Error loading cart:', error);
        return of([]);
      }),
    );
  }

  /**
   * Add or update item in cart via API
   */
  addItem(product: Product): Observable<CartItem[]> {
    const currentCount = this.cart()[product.id] || 0;
    return this.updateCartItem(product, currentCount + 1);
  }

  /**
   * Remove item from cart via API
   */
  removeItem(product: Product): Observable<CartItem[]> {
    const currentCount = this.cart()[product.id] || 0;
    if (currentCount > 0) {
      return this.updateCartItem(product, currentCount - 1);
    }
    return of(this.cartItems());
  }

  /**
   * Update cart item via API
   */
  private updateCartItem(
    product: Product,
    count: number,
  ): Observable<CartItem[]> {
    if (!this.endpointEnabled('cart')) {
      // Fallback to local state update
      this.updateLocalCart(product.id, count);
      return of([]);
    }

    const url = this.getUrl('cart', '/api/profile/cart');
    const request: UpdateCartRequest = {
      product: {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
      },
      count,
    };

    return this.http.put<CartItem[]>(url, request).pipe(
      tap((items) => {
        this.#cartItems.set(items);
        // Update local cart state
        const cartMap: Record<string, number> = {};
        items.forEach((item) => {
          cartMap[item.product.id] = item.count;
        });
        this.#cart.set(cartMap);
      }),
      catchError((error) => {
        console.error('Error updating cart:', error);
        // Fallback to local update on error
        this.updateLocalCart(product.id, count);
        return of(this.cartItems());
      }),
    );
  }

  /**
   * Clear cart via API
   */
  clearCart(): Observable<void> {
    if (!this.endpointEnabled('cart')) {
      this.empty();
      return of(void 0);
    }

    const url = this.getUrl('cart', '/api/profile/cart');
    return this.http.delete<void>(url).pipe(
      tap(() => {
        this.empty();
      }),
      catchError((error) => {
        console.error('Error clearing cart:', error);
        this.empty();
        return of(void 0);
      }),
    );
  }

  /**
   * Clear local cart state
   */
  empty(): void {
    this.#cart.set({});
    this.#cartItems.set([]);
  }

  /**
   * Update local cart state (fallback when API is disabled)
   */
  private updateLocalCart(id: string, count: number): void {
    const val = this.cart();
    const newVal = { ...val };

    if (count === 0) {
      delete newVal[id];
    } else {
      newVal[id] = count;
    }

    this.#cart.set(newVal);
  }
}
