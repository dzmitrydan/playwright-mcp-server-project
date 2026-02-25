import * as fs from 'fs';
import * as path from 'path';

export function extractCSVTotalPrice(csvContent: string): string {
  const lines = csvContent.split('\n').filter(line => line.trim());
  let csvTotalPrice = '';
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (/Total Price:/i.test(line)) {
      const parts = line.split(',');
      const priceCandidate = parts[parts.length - 2] || parts[parts.length - 1];
      const priceMatch = priceCandidate.match(/[\d.,]+/);
      if (priceMatch) {
        csvTotalPrice = priceMatch[0];
        break;
      }
    }
  }
  if (!csvTotalPrice) {
    const allPrices = Array.from(csvContent.matchAll(/[\d.,]+/g)).map(m => m[0]);
    if (allPrices.length > 0) {
      allPrices.sort((a, b) => parseFloat(b.replace(/,/g, '')) - parseFloat(a.replace(/,/g, '')));
      csvTotalPrice = allPrices[0];
    }
  }
  return parseFloat(csvTotalPrice).toFixed(2);
}

export function saveDownload(download: any, downloadDir: string): string {
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }
  const suggestedFilename = typeof download.suggestedFilename === 'function' ? download.suggestedFilename() : download.suggestedFilename;
  const downloadPath = path.join(downloadDir, suggestedFilename);
  try {
    download.saveAs(downloadPath);
  } catch (e) {
    // WebKit may not support saveAs in some environments
    console.warn('download.saveAs failed:', e);
  }
  return downloadPath;
}