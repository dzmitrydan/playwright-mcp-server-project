import { Page, expect } from '@playwright/test';

class WebHelper {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async openPage(url: string): Promise<string> {
        await this.page.goto(url);
        return `Opened URL: ${this.page.url()}`;
    }

    async inputText(locator: string, text: string): Promise<string> {
        await this.page.fill(locator, text);
        return `Text "${text}" entered into ${locator}`;
    }

    async clickButton(locator: string): Promise<string> {
        await this.page.click(locator);
        return `Clicked ${locator}`;
    }

    async webGetUrl(): Promise<string> {
        return this.page.url();
    }

    async webElementVisible(locator: string): Promise<string> {
        await expect(this.page.locator(locator)).toBeVisible();
        return `Element visible: ${locator}`;
    }
}

export default WebHelper;