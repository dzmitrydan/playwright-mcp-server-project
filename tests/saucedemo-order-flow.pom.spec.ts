import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/saucedemo/LoginPage';
import { ProductsPage } from '../pages/saucedemo/ProductsPage';
import { CartPage } from '../pages/saucedemo/CartPage';
import { CheckoutInfoPage } from '../pages/saucedemo/CheckoutInfoPage';
import { CheckoutOverviewPage } from '../pages/saucedemo/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/saucedemo/CheckoutCompletePage';

test('Saucedemo order flow', async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  const productsPage = new ProductsPage(page);
  const cartPage = new CartPage(page);
  const checkoutInfoPage = new CheckoutInfoPage(page);
  const checkoutOverviewPage = new CheckoutOverviewPage(page);
  const checkoutCompletePage = new CheckoutCompletePage(page);

  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');
  expect(await productsPage.isDisplayed()).toBeTruthy();
  await productsPage.addBackpackToCart();
  await productsPage.openCart();
  expect(await cartPage.hasBackpack()).toBeTruthy();
  await cartPage.proceedToCheckout();
  await checkoutInfoPage.enterInfo('John', 'Doe', '12345');
  expect(await checkoutOverviewPage.isTotalDisplayed()).toBeTruthy();
  await checkoutOverviewPage.finishCheckout();
  expect(await checkoutCompletePage.isThankYouDisplayed()).toBeTruthy();
  await context.close();
});
