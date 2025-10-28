// api/preview.js
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import fetch from 'node-fetch';
import { generateLayout } from './layout/ai-layout-generator.js';

// === Универсальная функция запуска Puppeteer (работает на Vercel) ===
const launchPuppeteer = async () => {
  const executablePath = await chromium.executablePath();
  console.log('Chromium path:', executablePath);

  return await puppeteer.launch({
    args: [
      ...chromium.args,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
      '--no-zygote',
      '--disable-extensions',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection'
    ],
    executablePath,
    headless: true,
    defaultViewport: { width: 1080, height: 1080, deviceScaleFactor: 1 },
    env: { ...process.env, PUPPETEER_CACHE_DIR: '/tmp' }
  });
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { text, image_url, logo_url, brand_color, business_name, category, goal } = body;
  if (!text || !image_url) return res.status(400).json({ error: 'Missing text or image_url' });

  // === Загрузка изображений в base64 ===
  const loadBase64 = async (url, name) => {
    if (!url) return null;
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      const mime = response.headers.get('content-type') || 'image/png';
      return `data:${mime};base64,${buffer.toString('base64')}`;
    } catch (err) {
      console.error(`Ошибка загрузки ${name}:`, err.message);
      return null;
    }
  };

  const [bgBase64, logoBase64] = await Promise.all([
    loadBase64(image_url, 'ФОН'),
    loadBase64(logo_url, 'ЛОГОТИП')
  ]);

  // === Генерация HTML через Gemini ===
  let html;
  try {
    html = await generateLayout({
      text,
      image_url: bgBase64,
      logo_url: logoBase64,
      brand_color,
      business_name,
      category,
      goal
    });
  } catch (err) {
    console.error('Gemini failed:', err.message);
    return res.status(500).json({ error: 'AI layout failed' });
  }

  // === Puppeteer: Основной рендер ===
  let browser;
  try {
    console.log('Запуск Puppeteer...');
    browser = await launchPuppeteer();

    const page = await browser.newPage();

    // Блокировка лишних ресурсов
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      if (['image', 'stylesheet', 'font'].includes(type)) {
        req.continue();
      } else {
        req.abort();
      }
    });

    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 20000 });
    console.log('HTML загружен');

    const screenshot = await page.screenshot({ type: 'png' });
    await browser.close();

    console.log('Скриншот готов, размер:', screenshot.length, 'байт');

    res.setHeader('Content-Type', 'image/png');
    res.send(screenshot);
    return;

  } catch (err) {
    console.error('Puppeteer error:', err.message);
    if (browser) await browser.close();
  }

  // === Fallback: Простой шаблон (если Puppeteer упал) ===
  try {
    console.log('Используется fallback шаблон...');
    const fallbackHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1080px;overflow:hidden;background:#000;font-family:system-ui,sans-serif;position:relative}
.bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover}
.overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.7))}
.logo-container{position:absolute;top:30px;left:30px;width:120px;height:120px;background:#fff;border-radius:16px;padding:8px;box-shadow:0 6px 20px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;border:3px solid #fff}
.logo{max-width:100%;max-height:100%;object-fit:contain}
.content{position:absolute;bottom:60px;left:50%;transform:translateX(-50%);color:white;text-align:center;max-width:88%}
.business{font-size:48px;font-weight:900;color:${brand_color || '#FF6600'};margin-bottom:16px;text-shadow:0 0 12px rgba(0,0,0,0.7)}
.text{font-size:36px;line-height:1.4;background:rgba(0,0,0,0.7);padding:26px 32px;border-radius:22px;backdrop-filter:blur(8px)}
</style></head><body>
${bgBase64 ? `<img class="bg" src="${bgBase64}">` : ''}
<div class="overlay"></div>
${logoBase64 ? `<div class="logo-container"><img class="logo" src="${logoBase64}"></div>` : ''}
<div class="content">
  <div class="business">${business_name || 'Clickify'}</div>
  <div class="text">${text.replace(/\n/g, '<br>')}</div>
</div>
</body></html>`;

    const fallbackBrowser = await launchPuppeteer();
    const page = await fallbackBrowser.newPage();
    await page.setContent(fallbackHtml, { waitUntil: 'domcontentloaded' });
    const screenshot = await page.screenshot({ type: 'png' });
    await fallbackBrowser.close();

    res.setHeader('Content-Type', 'image/png');
    res.send(screenshot);

  } catch (fallbackErr) {
    console.error('Fallback failed:', fallbackErr.message);
    res.status(500).json({ error: 'Render failed', details: fallbackErr.message });
  }
}

export const config = {
  api: {
    bodyParser: false
  }
};
