import {expect, test} from '@playwright/test';
import {LoginPage} from '../pages/saucedemo/LoginPage';
import loginObjectData from '../test-data/loginObjectData.json';
import {readData} from "../utils/dataReader";

const loginJSONData = readData('./test-data/loginArrayData.json');
const loginCSVData = readData('./test-data/loginDataCSV.csv');
const loginExcelData = readData('./test-data/loginData.xlsx', 'Sheet1');

test.describe('Login Tests', () => {
    /**
     * JSON OBJECT (valid)
     */
    test('Valid login test (JSON Object)', async ({page}) => {

        const loginPage = new LoginPage(page);
        await loginPage.goto();

        await loginPage.login(
            loginObjectData.valid_user.username,
            loginObjectData.valid_user.password
        );

        await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    });

    /**
     * JSON OBJECT (invalid)
     */
    test('Invalid login test (JSON Object)', async ({page}) => {

        const loginPage = new LoginPage(page);

        await loginPage.goto();
        await loginPage.login(
            loginObjectData.invalid_user.username,
            loginObjectData.invalid_user.password
        );
        await expect(loginPage.errorMessage).toBeVisible();
    });

    /**
     * JSON ARRAY (data-driven)
     */
    loginJSONData.forEach((data: any) => {
        if (!data.run) return;   // boolean true/false

        test(`Login Test JSON Array - ${data.username}`, async ({page}) => {
            const loginPage = new LoginPage(page);

            await loginPage.goto();
            await loginPage.login(data.username, data.password);

            if (data.expected === 'success') {
                await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
            } else {
                await expect(loginPage.errorMessage).toBeVisible();
            }
        });
    });

    /**
     * CSV (data-driven)
     */
    loginCSVData.forEach((data: any) => {

        if (data.run.trim() !== 'true') return;

        test(`Login Test CSV - ${data.username}`, async ({page}) => {
            const loginPage = new LoginPage(page);
            await loginPage.goto();

            await loginPage.login(
                data.username.trim(),
                data.password.trim()
            );

            if (data.expected.trim() === 'success') {
                await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
            } else {
                await expect(loginPage.errorMessage).toBeVisible();
            }
        });
    });

    /**
     * EXCEL (data-driven)
     */
    for (const data of loginExcelData) {

        // if (data.run !== 'yes') continue;
        test(`Login test for - ${data.username}`, async ({page}) => {

            test.skip(data.run !== 'yes', 'Run Flag=NO');

            const loginPage = new LoginPage(page);

            await test.step('Go to login page', async () => {
                await loginPage.goto();
            });

            await test.step('Perform Login', async () => {
                await loginPage.login(data.username, data.password);
            });

            await test.step('Validate Result', async () => {
                if (data.expected === 'success') {
                    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
                } else {
                    await expect(loginPage.errorMessage).toBeVisible();
                }
            });
        });
    }
});

