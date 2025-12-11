import { Page, Locator } from '@playwright/test';

export class CheckoutOverviewPage {
  readonly page: Page;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.totalLabel = page.locator('.summary_total_label');
    this.finishButton = page.locator('button[data-test="finish"]');
  }

  async isTotalDisplayed() {
    return this.totalLabel.isVisible();
  }

  async finishCheckout() {
    await this.finishButton.click();
  }
}
