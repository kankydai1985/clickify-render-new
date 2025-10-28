// api/layout/ai-layout-generator.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { JSDOM } from 'jsdom';
import DOMPurify from 'isomorphic-dompurify';
import crypto from 'crypto';

// Используем Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // или gemini-1.5-pro

const CACHE_DIR = '/tmp/clickify-cache';
const CACHE_FILE = path.join(CACHE_DIR, 'generated-layouts.json');
const MAX_CACHE_SIZE = 50;
const MAX_HTML_SIZE = 50 * 1024;

async function ensureCache() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.access(CACHE_FILE);
  } catch {
    await fs.writeFile(CACHE_FILE, '{}');
  }
}

async function loadCache() {
  await ensureCache();
  const data = await fs.readFile(CACHE_FILE, 'utf-8');
  return JSON.parse(data);
}

async function saveCache(cache) {
  const entries = Object.entries(cache);
  if (entries.length > MAX_CACHE_SIZE) {
    const sorted = entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
    cache = Object.fromEntries(sorted.slice(0, MAX_CACHE_SIZE));
  }
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function getCacheKey(data) {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

function generateFallbackHTML({ text, image_url, logo_url, brand_color, business_name }) {
  const bg = image_url ? `<img class="bg" src="${image_url}" />` : '';
  const logo = logo_url ? `<div class="logo-container"><img class="logo" src="${logo_url}" /></div>` : '';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1080px;position:relative;overflow:hidden;font-family:system-ui,sans-serif;background:#000}
.bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:1}
.overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.7));z-index:2}
.logo-container{position:absolute;top:30px;left:30px;width:120px;height:120px;background:#fff;border-radius:16px;padding:8px;box-shadow:0 6px 20px rgba(0,0,0,0.5);z-index:100;display:flex;align-items:center;justify-content:center;border:3px solid #fff}
.logo{max-width:100%;max-height:100%;object-fit:contain}
.content{position:absolute;bottom:60px;left:50%;transform:translateX(-50%);color:white;text-align:center;z-index:10;max-width:88%}
.business{font-size:48px;font-weight:900;color:${brand_color || '#FF6600'};margin-bottom:16px;text-shadow:0 0 12px rgba(0,0,0,0.7)}
.text{font-size:36px;line-height:1.4;background:rgba(0,0,0,0.7);padding:26px 32px;border-radius:22px;backdrop-filter:blur(8px)}
</style>
</head><body>
${bg}
<div class="overlay"></div>
${logo}
<div class="content">
  <div class="business">${business_name || 'Clickify'}</div>
  <div class="text">${text.replace(/\n/g, '<br>')}</div>
</div>
</body></html>`;
}

export async function generateLayout(input) {
  const { text, image_url, logo_url, brand_color, business_name, category, goal } = input;
  const cacheKey = getCacheKey({ text, brand_color, category, goal, image_url, logo_url, business_name });
  const cache = await loadCache();

  if (cache[cacheKey]) {
    console.log('Gemini Layout: Cache hit');
    return cache[cacheKey].html;
  }

  try {
    const prompt = `
Ты — дизайнер Instagram-баннеров 1080x1080.
Создай HTML с встроенным CSS.

Требования:
- Размер: 1080x1080
- Фон: ${image_url ? 'используй <img class="bg" src="..."> с object-fit: cover' : 'градиент или цвет'}
- Логотип: ${logo_url ? 'в верхнем левом углу, в белой рамке' : 'не использовать'}
- Цвет бренда: ${brand_color || '#FF6600'}
- Название: "${business_name || 'Бизнес'}"
- Текст: "${text}"
- Категория: ${category || 'общая'}
- Цель: ${goal || 'привлечь внимание'}

Стиль: современный, чистый, профессиональный.
Используй flex/grid, backdrop-filter, text-shadow.
Только <html>, <head>, <style>, <body>.
Никаких <script>, внешних ссылок, !important, position: fixed.

Верни ТОЛЬКО HTML-код.
    `.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let html = response.text().trim();

    // Убираем возможные ```html
    html = html.replace(/^```html\n/, '').replace(/\n```$/, '');

    if (Buffer.byteLength(html, 'utf8') > MAX_HTML_SIZE) {
      html = html.slice(0, MAX_HTML_SIZE);
    }

    if (!html.includes('<html') || !html.includes('<style')) {
      throw new Error('Gemini не вернул валидный HTML');
    }

    const dom = new JSDOM(html);
    let cleanHtml = DOMPurify.sanitize(dom.window.document.documentElement.outerHTML, {
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link', 'meta'],
      FORBID_ATTR: ['onload', 'onclick', 'onerror', 'srcset', 'href'],
      ADD_TAGS: ['style'],
      ADD_ATTR: ['class', 'style'],
    });

    cleanHtml = cleanHtml
      .replace(/overflow:\s*[^;}]+/gi, 'overflow: hidden')
      .replace(/position:\s*fixed/gi, 'position: absolute')
      .replace(/!important/g, '')
      .replace(/<head>/i, '<head><meta charset="utf-8">');

    cache[cacheKey] = { html: cleanHtml, timestamp: Date.now() };
    await saveCache(cache);

    return cleanHtml;
  } catch (err) {
    console.warn('Gemini failed, using fallback:', err.message);
    const fallback = generateFallbackHTML(input);
    cache[cacheKey] = { html: fallback, timestamp: Date.now(), fallback: true };
    await saveCache(cache);
    return fallback;
  }
}
