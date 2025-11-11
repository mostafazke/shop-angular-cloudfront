import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/header/header.component';
import { CartService } from './cart/cart.service';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [HeaderComponent, RouterOutlet],
})
export class AppComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    if (this.authService.hasToken()) {
      this.cartService.loadCart().subscribe({
        error: (err) => {
          console.error('Failed to load cart on startup:', err);
        },
      });
    }
  }
}
