import {Page, Locator, expect} from '@playwright/test';

export class ShareEstimatePopUpWindow {
    readonly page: Page;
    readonly closeButton: Locator;
    readonly copyLinkButton: Locator;
    readonly shareEstimationCost: Locator;

    constructor(page: Page) {
        this.page = page;
        this.closeButton = page.getByRole('button', { name: 'Close dialog' });
        this.copyLinkButton = page.getByRole('button', { name: 'Copy link' });
        this.shareEstimationCost = page.getByLabel('Share Estimate Dialog');
    }

    async clickCloseButton() {
        await this.closeButton.click();
    }

    async clickCopyLinkButton() {
        await this.copyLinkButton.click();
    }

    async getEstimateCost(): Promise<string> {
        const costLocator = this.page.locator(`text=/[\\d.,]+\\s*\\/\\s*(mo|month)/i`).first();
    await expect(costLocator).toBeVisible({ timeout: 10000 });

    let text = await costLocator.textContent();
    if (!text) throw new Error('Estimated cost not found');

        // Extract the first decimal number (price) from the text
        const match = text.match(/\d+\.\d+/);
        if (!match) throw new Error('Estimated cost format not found');
        return parseFloat(match[0]).toFixed(2);
    }
}