import { Page, Locator, expect } from '@playwright/test';

export class ComputeEnginePage {
  readonly page: Page;
  readonly instancesInput: Locator;
  readonly osDropdown: Locator;
  readonly estimatedCostSection: Locator;
  readonly costLocator: Locator;
  readonly deleteGroupButton: Locator;
  readonly addItemsToYourEstimateTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.instancesInput = page.getByRole('spinbutton', { name: 'Number of instances*' });
    this.osDropdown = page.getByRole('combobox', { name: /Operating System/ });
    this.estimatedCostSection = page.locator('text=Estimated cost').first();
    this.costLocator = page.locator('text=/\$[\d.,]+\s*\/\s*(month|mo)/i');
    this.deleteGroupButton = page.getByRole('button', { name: /Delete group/ });
    this.addItemsToYourEstimateTitle = page.locator('text=Add items to your estimate');
  }

  async setNumberOfInstances(count: number) {
    await this.instancesInput.fill(count.toString());
  }

  async selectOS(osName: string) {
    await this.osDropdown.click();
    const option = this.page.getByRole('option', { name: osName });
    await option.click();
  }

  async selectProvisioningModel(modelName: string) {
    let radio = this.page.getByRole('radio', { name: modelName });
    try {
      await radio.waitFor({ state: 'attached', timeout: 5000 });
    } catch (e) {
      // fallback: try by value
      let value = '';
      if (modelName === 'Spot (Preemptible VM)') value = 'spot';
      else if (modelName === 'Regular') value = 'regular';
      if (value) {
        radio = this.page.locator(`input[type="radio"][value="${value}"]`);
        await radio.waitFor({ state: 'attached', timeout: 5000 });
      } else {
        throw e;
      }
    }
    // Try to click the label if radio is hidden
    if (!(await radio.isChecked())) {
      const isVisible = await radio.isVisible();
      if (!isVisible) {
        // Try to click the label associated with the radio
        const label = await radio.evaluateHandle((el) => el.closest('label'));
        if (label) {
          try {
            // @ts-ignore
            await label.asElement().click();
            return;
          } catch {}
        }
        // If label click fails, try to click via JS
        // @ts-ignore
        await radio.evaluate((el) => el.click());
      } else {
        await radio.click();
      }
    }
  }

  async waitForEstimatedCost() {
    await expect(this.estimatedCostSection).toBeVisible({ timeout: 10000 });
  }

  async getEstimateCost(): Promise<string> {
    const costLocator = this.page.locator('text=/\\$[\\d.,]+\\s*\\/\\s*(mo|month)/i').first();
    await expect(costLocator).toBeVisible({ timeout: 10000 });

    let text = await costLocator.textContent();
    if (!text) throw new Error('Estimated cost not found');

    // Extract the first decimal number (price) from the text
    const match = text.match(/\d+\.\d+/);
    if (!match) throw new Error('Estimated cost format not found');
    return parseFloat(match[0]).toFixed(2);
}

async downloadEstimateCSV(): Promise<string> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByRole('button', { name: /Download estimate as .csv|Download/ }).click(),
    ]);
    const downloadDir = 'test-downloads';
    const fs = require('fs');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
    const filePath = `${downloadDir}/${download.suggestedFilename()}`;
    await download.saveAs(filePath);
    return filePath;
  }

  async clickDeleteGroupButton() {
    await this.deleteGroupButton.click();
  }

  async checkAddItemsToYourEstimateTitle(): Promise<boolean> {
    await this.page.waitForTimeout(1000);
    return await this.addItemsToYourEstimateTitle.isVisible();
  }
}