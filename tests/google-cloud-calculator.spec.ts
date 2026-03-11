import {expect, test} from '@playwright/test';
import {ComputeEnginePage} from '../pages/computeEngine/ComputeEnginePage';
import {CalculatorPage} from '../pages/computeEngine/CalculatorPage';
import * as fs from 'fs';
import {extractCSVTotalPrice} from '../utils/estimateUtils';
import {DeletePopUpWindow} from "../pages/computeEngine/DeletePopUpWindow";

test('Test 1', async ({page, context}) => {
    const calculatorPage = new CalculatorPage(page);
    const computePage = new ComputeEnginePage(page);

    await calculatorPage.openPage();
    await calculatorPage.addEstimate();
    await calculatorPage.selectComputeEngine();

    await computePage.setNumberOfInstances(3);
    expect(Number(await computePage.instancesInput.inputValue())).toBe(3);

    await computePage.selectOS('Paid: Ubuntu Pro');
    await computePage.selectProvisioningModel('Regular');

    let capturedEstimateCost = await computePage.getEstimateCost();
    console.log(`Captured estimated cost: ${capturedEstimateCost}`);

    const filePath = await computePage.downloadEstimateCSV();
    const fs = require('fs');
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    let csvTotalPrice = extractCSVTotalPrice(csvContent);
    console.log(`Extracted CSV price: ${csvTotalPrice}`);

    expect(capturedEstimateCost).toBe(csvTotalPrice);
});

test('Test 2', async ({page, context}) => {
    const calculatorPage = new CalculatorPage(page);
    const computePage = new ComputeEnginePage(page);
    const deletePopUpWindow = new DeletePopUpWindow(page);

    await calculatorPage.openPage();
    await calculatorPage.addEstimate();
    await calculatorPage.selectComputeEngine();

    await computePage.setNumberOfInstances(10);
    expect(Number(await computePage.instancesInput.inputValue())).toBe(10);

    await computePage.selectOS('Free: Debian, CentOS, CoreOS, Ubuntu or BYOL (Bring Your Own License)');
    await computePage.selectProvisioningModel('Spot (Preemptible VM)');

    await computePage.getEstimateCost();

    await computePage.clickDeleteGroupButton();
    await deletePopUpWindow.clickCancelButton();
    await computePage.clickDeleteGroupButton();
    await deletePopUpWindow.clickDeleteButton();
    await computePage.checkAddItemsToYourEstimateTitle();
});