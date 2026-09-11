import {Page} from "@playwright/test";

export class BasePage {
    protected page: Page;
    constructor(page: Page) {
        this.page = page;
    }

    async acceptCookies() {
        const btn = this.page.locator('button:has-text("OK, got it")');
        if (await btn.isVisible()) {
            await btn.click();
        }
    }
}