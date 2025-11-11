import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Order } from './order.interface';
import { ApiService } from '../../core/api.service';
import { catchError, map } from 'rxjs/operators';
import { Order as CartOrder } from '../../cart/cart-api.interface';

@Injectable()
export class OrdersService extends ApiService {
  getOrders(): Observable<Order[]> {
    // If cart API is enabled, fetch from there
    if (this.endpointEnabled('cart')) {
      const url = this.getUrl('cart', '/api/profile/cart/order');
      return this.http.get<CartOrder[]>(url).pipe(
        map((cartOrders) =>
          cartOrders.map((order) => this.convertCartOrderToOrder(order)),
        ),
        catchError((error) => {
          console.error('Error fetching orders:', error);
          return of([]);
        }),
      );
    }

    return of([]);
  }

  /**
   * Convert Cart API Order to Admin Order format
   */
  private convertCartOrderToOrder(cartOrder: CartOrder): Order {
    return {
      id: cartOrder.id,
      address: {
        address: cartOrder.address.address,
        comment: cartOrder.address.comment,
        firstName: '', // Not available from cart API
        lastName: '', // Not available from cart API
      },
      items: cartOrder.items,
      statusHistory: [], // Not available from cart API
    };
  }
}
