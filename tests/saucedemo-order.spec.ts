import { test, expect } from '@playwright/test';

test('Saucedemo end-to-end order flow', async ({ page }) => {
  // 1. Navigate to https://www.saucedemo.com
  await page.goto('https://www.saucedemo.com');

  // 2. Log in using username: standard_user and password: secret_sauce
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();

  // 3. Verify that the products page is displayed
  await expect(page).toHaveURL(/.*inventory.html/);
  await expect(page.locator('.title')).toHaveText('Products');

  // 4. Add "Sauce Labs Backpack" to the cart
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

  // 5. Open the cart
  await page.locator('[data-test="shopping-cart-link"]').click();

  // 6. Verify that "Sauce Labs Backpack" is present in the cart
  await expect(page.locator('.cart_item .inventory_item_name')).toHaveText('Sauce Labs Backpack');

  // 7. Proceed to checkout
  await page.locator('[data-test="checkout"]').click();

  // 8. Enter first name John, last name Doe, postal code 12345
  await page.locator('[data-test="firstName"]').fill('John');
  await page.locator('[data-test="lastName"]').fill('Doe');
  await page.locator('[data-test="postalCode"]').fill('12345');

  // 9. Continue to the overview page
  await page.locator('[data-test="continue"]').click();

  // 10. Verify that the total price is displayed
  await expect(page.locator('.summary_total_label')).toBeVisible();

  // 11. Finish the checkout
  await page.locator('[data-test="finish"]').click();

  // 12. Verify that the “Thank you for your order!” message appears
  await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
});
