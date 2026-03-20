import { Page, Locator } from '@playwright/test';

export class ShareEstimatePopUpWindow {
    readonly page: Page;
    readonly closeButton: Locator;
    readonly copyLinkButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.closeButton = page.getByRole('button', { name: 'Close dialog' });
        this.copyLinkButton = page.getByRole('button', { name: 'Copy link' });
    }

    async clickCloseButton() {
        await this.closeButton.click();
    }

    async clickCopyLinkButton() {
        await this.copyLinkButton.click();
    }
}