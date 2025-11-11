/** Cart item returned from API */
export interface CartItem {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
  };
  count: number;
}

/** Request body for updating cart */
export interface UpdateCartRequest {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
  };
  count: number;
}

/** Address information for order */
export interface OrderAddress {
  address: string;
  comment?: string;
}

/** Request body for checkout/creating order */
export interface CheckoutRequest {
  address: OrderAddress;
}

/** Order information */
export interface Order {
  id: string;
  userId: string;
  cartId: string;
  items: CartItem[];
  address: OrderAddress;
  total: number;
}

/** Response from checkout endpoint */
export interface CheckoutResponse {
  order: Order;
}
