import {expect, test} from '@playwright/test';
import {LoginPage} from '../pages/saucedemo/LoginPage';
import {ProductsPage} from '../pages/saucedemo/ProductsPage';

test.describe('Products Sorting Options', () => {
    let loginPage: LoginPage;
    let productsPage: ProductsPage;

    test.beforeEach(async ({page}) => {
        loginPage = new LoginPage(page);
        productsPage = new ProductsPage(page);

        await loginPage.goto();
        await loginPage.login('standard_user', 'secret_sauce');
    });

    test('should sort products alphabetically A to Z', async () => {
        await productsPage.selectSortOption('az');
        expect(await productsPage.areProductsSortedAZ()).toBeTruthy();
    });

    test('should sort products alphabetically Z to A', async () => {
        await productsPage.selectSortOption('za');
        expect(await productsPage.areProductsSortedZA()).toBeTruthy();
    });

    test('should sort products by price low to high', async () => {
        await productsPage.selectSortOption('lohi');
        expect(await productsPage.areProductsSortedPriceLowToHigh()).toBeTruthy();
    });

    test('should sort products by price high to low', async () => {
        await productsPage.selectSortOption('hilo');
        expect(await productsPage.areProductsSortedPriceHighToLow()).toBeTruthy();
    });
});
