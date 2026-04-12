import {Page} from "playwright-core";
import {Context} from "vm";

export function extractCSVTotalPrice(csvContent: string): string {
    // Find the line with 'Total Price:' and extract the price from the next column
    const lines = csvContent.split('\n').filter(line => line.trim());
    let csvTotalPrice = '';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/Total Price:/i.test(line)) {
            // The price is the value after the last comma
            const parts = line.split(',');
            // Find the last non-empty part (should be the price)
            for (let j = parts.length - 1; j >= 0; j--) {
                const priceMatch = parts[j].match(/\d+\.\d+/);
                if (priceMatch) {
                    csvTotalPrice = priceMatch[0];
                    break;
                }
            }
            if (csvTotalPrice) break;
        }
    }
    if (!csvTotalPrice) {
        // fallback: find the largest number in the file
        const allPrices = Array.from(csvContent.matchAll(/\d+\.\d+/g)).map(m => m[0]);
        if (allPrices.length > 0) {
            allPrices.sort((a, b) => parseFloat(b) - parseFloat(a));
            csvTotalPrice = allPrices[allPrices.length - 1];
        }
    }
    return parseFloat(csvTotalPrice).toFixed(2);
}

export async function getTextFromClipboard(page: Page): Promise<string> {
    return await page.evaluate(async () => {
      return await navigator.clipboard.readText();
  });
}

export async function openNewBrowserTab(context: Context, url: string): Promise<Page> {
  const page = await context.newPage();
  await page.goto(url);
  return page;
}