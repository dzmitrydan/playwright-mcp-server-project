import { Page, Locator } from '@playwright/test';

export class DeletePopUpWindow {
    readonly page: Page;
    readonly cancelButton: Locator;
    readonly deleteButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.cancelButton = page.getByRole('button', { name: /Cancel/ });
        this.deleteButton = page.getByRole('button', { name: /^Delete$/ });
    }

    async clickCancelButton(): Promise<void> {
        await this.cancelButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.cancelButton.click();
    }

    async clickDeleteButton(): Promise<void> {
        await this.deleteButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.deleteButton.click();
    }
}