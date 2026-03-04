import { Page, Locator, expect } from '@playwright/test';
import path from 'path';
import * as fs from 'fs';

export class ComputeEnginePage {
  readonly page: Page;
  readonly machineTypeCombobox: Locator;
  readonly instancesInput: Locator;
  readonly osDropdown: Locator;
  readonly ubuntuProOption: Locator;
  readonly regularRadio: Locator;
  readonly estimatedCostSection: Locator;
  readonly costLocator: Locator;
  readonly downloadButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.machineTypeCombobox = page.getByRole('combobox', { name: 'Machine Family' });
    this.instancesInput = page.getByRole('spinbutton', { name: 'Number of instances*' });
    this.osDropdown = page.getByRole('combobox', { name: /Operating System/ });
    this.ubuntuProOption = page.getByRole('option', { name: /Paid: Ubuntu Pro/ });
    this.regularRadio = page.getByRole('radio', { name: 'Regular' });
    this.estimatedCostSection = page.locator('text=Estimated cost').first();
    this.costLocator = page.locator('text=/\$[\d.,]+\s*\/\s*(month|mo)/i');
    this.downloadButton = page.getByRole('button', { name: /Download estimate as .csv|Download/ });
  }

  async setNumberOfInstances(count: number) {
    await this.instancesInput.fill(count.toString());
  }

  async selectOS(osName = 'Paid: Ubuntu Pro') {
    await this.osDropdown.click();
    const option = this.page.getByRole('option', { name: osName });
    await option.click();
  }

  async selectProvisioningModel(modelName: string) {
    const radio = this.page.getByRole('radio', { name: modelName });
    if (!(await radio.isChecked())) {
      await radio.click();
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

     text = text.replace(/[^0-9.,]/g, '');
    return text;
}

  async downloadEstimateCSV(): Promise<string> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadButton.click(),
    ]);

    const downloadDir = path.resolve(__dirname, '../../downloads');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    const fileName = download.suggestedFilename();
    const filePath = path.join(downloadDir, fileName);

    await download.saveAs(filePath);
    return filePath;
  }
}