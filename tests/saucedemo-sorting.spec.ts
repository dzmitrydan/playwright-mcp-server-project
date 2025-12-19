import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';

test.describe('Products Sorting Options', () => {
  let loginPage: LoginPage;
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);

    // Navigate and login before each test
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('Verify products sorted alphabetically A to Z', async () => {
    // Select Name (A to Z) from the sort dropdown
    await productsPage.selectSortOption('az');

    // Verify products are sorted alphabetically from A to Z
    const isSorted = await productsPage.areProductsSortedAZ();
    expect(isSorted).toBeTruthy();
  });

  test('Verify products sorted alphabetically Z to A', async () => {
    // Select Name (Z to A) from the sort dropdown
    await productsPage.selectSortOption('za');

    // Verify products are sorted alphabetically from Z to A
    const isSorted = await productsPage.areProductsSortedZA();
    expect(isSorted).toBeTruthy();
  });

  test('Verify products sorted by price low to high', async () => {
    // Select Price (low to high) from the sort dropdown
    await productsPage.selectSortOption('lohi');

    // Verify products are sorted by price from lowest to highest
    const isSorted = await productsPage.areProductsSortedPriceLowToHigh();
    expect(isSorted).toBeTruthy();
  });

  test('Verify products sorted by price high to low', async () => {
    // Select Price (high to low) from the sort dropdown
    await productsPage.selectSortOption('hilo');

    // Verify products are sorted by price from highest to lowest
    const isSorted = await productsPage.areProductsSortedPriceHighToLow();
    expect(isSorted).toBeTruthy();
  });
});
