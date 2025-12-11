import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutInfoPage } from '../pages/CheckoutInfoPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';

test('Saucedemo order flow', async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  const productsPage = new ProductsPage(page);
  const cartPage = new CartPage(page);
  const checkoutInfoPage = new CheckoutInfoPage(page);
  const checkoutOverviewPage = new CheckoutOverviewPage(page);
  const checkoutCompletePage = new CheckoutCompletePage(page);

  // 1. Navigate to https://www.saucedemo.com
  await loginPage.goto();

  // 2. Log in
  await loginPage.login('standard_user', 'secret_sauce');

  // 3. Verify that the products page is displayed
  await expect(await productsPage.isDisplayed()).toBeTruthy();

  // 4. Add "Sauce Labs Backpack" to the cart
  await productsPage.addBackpackToCart();

  // 5. Open the cart
  await productsPage.openCart();

  // 6. Verify that "Sauce Labs Backpack" is present in the cart
  await expect(await cartPage.hasBackpack()).toBeTruthy();

  // 7. Proceed to checkout
  await cartPage.proceedToCheckout();

  // 8. Enter first name John, last name Doe, postal code 12345
  await checkoutInfoPage.enterInfo('John', 'Doe', '12345');

  // 9. Continue to the overview page
  // (Handled by enterInfo)

  // 10. Verify that the total price is displayed
  await expect(await checkoutOverviewPage.isTotalDisplayed()).toBeTruthy();

  // 11. Finish the checkout
  await checkoutOverviewPage.finishCheckout();

  // 12. Verify that the “Thank you for your order!” message appears
  await expect(await checkoutCompletePage.isThankYouDisplayed()).toBeTruthy();

  // 13. Close all web pages
  await context.close();
});
