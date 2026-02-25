import { Page, Locator } from '@playwright/test';

export class CalculatorPage {
  readonly page: Page;
  readonly addEstimateButton: Locator;
  readonly computeEngineButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addEstimateButton = page.getByRole('button', { name: 'Add to estimate' }).first();
    this.computeEngineButton = page.getByRole('button').filter({ hasText: /Compute Engine/ }).first();
  }

  async openPage() {
    await this.page.goto('https://cloud.google.com/products/calculator/');
  }

  async addEstimate() {
    await this.addEstimateButton.click();
  }

  async selectComputeEngine() {
    await this.computeEngineButton.click();
  }
}
