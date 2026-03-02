import { test, expect } from '@playwright/test';
import { ComputeEnginePage } from '../pages/computeEngine/ComputeEnginePage';
import { CalculatorPage } from '../pages/computeEngine/CalculatorPage';
import * as fs from 'fs';
import { extractCSVTotalPrice } from '../utils/estimateUtils';

test('Google Cloud Calculator - Check CSV price', async ({ page, context }) => {
  const calculatorPage = new CalculatorPage(page);
  const computePage = new ComputeEnginePage(page);

  await calculatorPage.openPage();
  await calculatorPage.addEstimate();
  await calculatorPage.selectComputeEngine();

  await computePage.setNumberOfInstances(3);
  expect(Number(await computePage.instancesInput.inputValue())).toBe(3);

  await computePage.selectOS();
  await computePage.selectProvisioningModel('Regular');
  await expect(computePage.regularRadio).toBeChecked();

  await computePage.selectOS('Paid: Ubuntu Pro');

  await computePage.selectProvisioningModel('Regular');
  await expect(computePage.regularRadio).toBeChecked();

  let capturedEstimateCost = await computePage.getEstimateCost();
  console.log(`Captured estimated cost: ${capturedEstimateCost}`);

  const downloadPath = await computePage.downloadEstimateCSV();
  expect(downloadPath).toBeTruthy();
  const csvContent = fs.readFileSync(downloadPath, 'utf-8');
  let csvTotalPrice = extractCSVTotalPrice(csvContent);
  console.log(`Extracted CSV price: ${csvTotalPrice}`);

  expect(capturedEstimateCost).toBe(csvTotalPrice);
});
