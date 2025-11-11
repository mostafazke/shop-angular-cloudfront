import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { CheckoutService } from './checkout.service';
import { CartService } from './cart.service';
import { CartShippingFormComponent } from './cart-shipping-form/cart-shipping-form.component';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import {
  MatStep,
  MatStepper,
  MatStepperNext,
  MatStepperPrevious,
} from '@angular/material/stepper';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { AsyncPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { NotificationService } from '../core/notification.service';
import { ProductsService } from '../products/products.service';
import { OrderAddress } from './cart-api.interface';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
  standalone: true,
  imports: [
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatStepper,
    MatStep,
    OrderSummaryComponent,
    MatProgressSpinner,
    MatButton,
    MatStepperNext,
    CartShippingFormComponent,
    MatStepperPrevious,
    AsyncPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly checkoutService = inject(CheckoutService);
  private readonly cartService = inject(CartService);
  private readonly notificationService = inject(NotificationService);
  private readonly productsService = inject(ProductsService);

  products = toSignal(this.checkoutService.getProductsForCheckout(), {
    initialValue: [],
  });

  isPlacingOrder = signal(false);

  totalPrice = computed(() => {
    const products = this.products();
    const total = products.reduce((acc, val) => acc + val.totalPrice, 0);
    return +total.toFixed(2);
  });

  cartNotEmpty = computed(() => {
    return this.cartService.totalInCart() > 0;
  });

  shippingInfo = this.fb.group({
    lastName: ['', Validators.required],
    firstName: ['', Validators.required],
    address: ['', Validators.required],
    comment: '',
  });

  get fullName(): string {
    const { firstName, lastName } = this.shippingInfo.value;
    return `${firstName} ${lastName}`;
  }

  get address(): string {
    return this.shippingInfo.value.address;
  }

  get comment(): string {
    return this.shippingInfo.value.comment;
  }

  add(id: string): void {
    this.productsService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.cartService.addItem(product).subscribe({
            error: (err) => {
              this.notificationService.showError('Failed to add item to cart');
              console.error('Error adding to cart:', err);
            },
          });
        }
      },
      error: (err) => {
        this.notificationService.showError('Failed to load product');
        console.error('Error loading product:', err);
      },
    });
  }

  remove(id: string): void {
    this.productsService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.cartService.removeItem(product).subscribe({
            error: (err) => {
              this.notificationService.showError(
                'Failed to remove item from cart',
              );
              console.error('Error removing from cart:', err);
            },
          });
        }
      },
      error: (err) => {
        this.notificationService.showError('Failed to load product');
        console.error('Error loading product:', err);
      },
    });
  }

  placeOrder(): void {
    if (this.shippingInfo.invalid) {
      this.notificationService.showError('Please fill in all required fields');
      return;
    }

    this.isPlacingOrder.set(true);

    const orderAddress: OrderAddress = {
      address: this.shippingInfo.value.address,
      comment: this.shippingInfo.value.comment || undefined,
    };

    this.checkoutService.checkout(orderAddress).subscribe({
      next: (response) => {
        this.isPlacingOrder.set(false);
        this.notificationService.showSuccess(
          `Order ${response.order.id} placed successfully!`,
        );
        this.cartService.empty();
        this.shippingInfo.reset();
      },
      error: (err) => {
        this.isPlacingOrder.set(false);
        this.notificationService.showError('Failed to place order');
        console.error('Error placing order:', err);
      },
    });
  }
}
