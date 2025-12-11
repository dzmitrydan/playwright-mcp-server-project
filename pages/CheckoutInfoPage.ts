import { Page, Locator } from '@playwright/test';

export class CheckoutInfoPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('input[data-test="firstName"]');
    this.lastNameInput = page.locator('input[data-test="lastName"]');
    this.postalCodeInput = page.locator('input[data-test="postalCode"]');
    this.continueButton = page.locator('input[data-test="continue"]');
  }

  async enterInfo(first: string, last: string, postal: string) {
    await this.firstNameInput.fill(first);
    await this.lastNameInput.fill(last);
    await this.postalCodeInput.fill(postal);
    await this.continueButton.click();
  }
}
