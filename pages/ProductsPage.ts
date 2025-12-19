import { Page, Locator } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly backpackAddButton: Locator;
  readonly cartIcon: Locator;
  readonly sortDropdown: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.title');
    this.backpackAddButton = page.locator('button[data-test="add-to-cart-sauce-labs-backpack"]');
    this.cartIcon = page.locator('.shopping_cart_link');
    this.sortDropdown = page.locator('.product_sort_container');
    this.productNames = page.locator('.inventory_item_name');
    this.productPrices = page.locator('.inventory_item_price');
  }

  async isDisplayed() {
    return this.title.isVisible();
  }

  async addBackpackToCart() {
    await this.backpackAddButton.click();
  }

  async openCart() {
    await this.cartIcon.click();
  }

  async selectSortOption(option: string) {
    await this.sortDropdown.selectOption(option);
    await this.page.waitForLoadState('networkidle');
  }

  async getProductNames(): Promise<string[]> {
    const names = await this.productNames.allTextContents();
    return names;
  }

  async getProductPrices(): Promise<number[]> {
    const pricesText = await this.productPrices.allTextContents();
    return pricesText.map(price => parseFloat(price.replace('$', '')));
  }

  async areProductsSortedAZ(): Promise<boolean> {
    const names = await this.getProductNames();
    const sorted = [...names].sort();
    return JSON.stringify(names) === JSON.stringify(sorted);
  }

  async areProductsSortedZA(): Promise<boolean> {
    const names = await this.getProductNames();
    const sorted = [...names].sort().reverse();
    return JSON.stringify(names) === JSON.stringify(sorted);
  }

  async areProductsSortedPriceLowToHigh(): Promise<boolean> {
    const prices = await this.getProductPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    return JSON.stringify(prices) === JSON.stringify(sorted);
  }

  async areProductsSortedPriceHighToLow(): Promise<boolean> {
    const prices = await this.getProductPrices();
    const sorted = [...prices].sort((a, b) => b - a);
    return JSON.stringify(prices) === JSON.stringify(sorted);
  }
}
