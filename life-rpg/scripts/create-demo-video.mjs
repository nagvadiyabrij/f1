import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
const projectDir = path.resolve(import.meta.dirname, '..');
const publicDir = path.join(projectDir, 'public');
const videoPath = path.join(publicDir, 'demo.webm');

await mkdir(publicDir, { recursive: true });

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: publicDir, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();
const video = page.video();

for (const route of ['/', '/register', '/dashboard']) {
  await page.goto(`${appUrl}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
}

await context.close();
await video.saveAs(videoPath);
await browser.close();
