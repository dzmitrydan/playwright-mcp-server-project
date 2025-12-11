import { Page, Locator } from '@playwright/test';

export class CheckoutCompletePage {
  readonly page: Page;
  readonly thankYouMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.thankYouMessage = page.locator('.complete-header');
  }

  async isThankYouDisplayed() {
    return this.thankYouMessage.isVisible();
  }
}
