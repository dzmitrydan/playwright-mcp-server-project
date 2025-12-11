import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItem: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItem = page.locator('.cart_item:has-text("Sauce Labs Backpack")');
    this.checkoutButton = page.locator('button[data-test="checkout"]');
  }

  async hasBackpack() {
    return this.cartItem.isVisible();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }
}
