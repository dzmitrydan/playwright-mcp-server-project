import { test, expect, chromium } from '@playwright/test';
import { ComputeEnginePage } from '../pages/computeEngine/ComputeEnginePage';
import { CalculatorPage } from '../pages/computeEngine/CalculatorPage';
import { getTextFromClipboard, openNewBrowserTab } from '../utils/estimateUtils';
import { ShareEstimatePopUpWindow } from '../pages/computeEngine/ShareEstimatePopUpWindow';

test('test', async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    permissions: ['clipboard-read', 'clipboard-write']
  });

  const page = await context.newPage();
  const calculatorPage = new CalculatorPage(page);
  const computePage = new ComputeEnginePage(page);
  const sharePopUpWindow = new ShareEstimatePopUpWindow(page);

  await calculatorPage.openPage();
  await calculatorPage.addEstimate();
  await calculatorPage.selectComputeEngine();  
  await computePage.setNumberOfInstances(5);
  await expect(page.getByRole('spinbutton', { name: 'Number of instances*' })).toHaveValue('5');

  await computePage.clickSwitchButton('Advanced settings');
  await computePage.setInstancesUsingEphemeralPublicIP(1);
  await computePage.setInstancesUsingStaticPublicIP(1);
  await computePage.setNumberOfVCPUs(10);
  await computePage.setAmountOfMemory(15);

  await computePage.selectDropdownCurrencyOption('Polish Zloty (PLN)');
  await computePage.clickShareButton();
  await sharePopUpWindow.clickCopyLinkButton();
  await sharePopUpWindow.clickCloseButton();

  const url = await getTextFromClipboard(page);
  const page2 = await openNewBrowserTab(context, url);
});