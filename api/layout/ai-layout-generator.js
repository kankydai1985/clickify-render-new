// api/layout/ai-layout-generator.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateLayout({
  text,
  image_url,
  logo_url,
  brand_color,
  business_name,
  category,
  goal
}) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
You are an expert in designing 1080x1080 Instagram/Facebook ad banners.
Create full HTML code with inline CSS.

Requirements:
- Size: 1080x1080
- Background: ${image_url ? 'use <img class="bg" src="BACKGROUND_IMAGE_URL"> with object-fit: cover' : 'gradient or solid color'}
- Logo: ${logo_url ? 'top-left, white frame: <img class="logo" src="LOGO_URL">' : 'do not use'}
- Brand color: ${brand_color || '#FF6600'}
- Business name: "${business_name || 'Clickify'}"
- Text: "${text}"
- Category: ${category || 'general'}
- Goal: ${goal || 'increase sales'}

Style: modern, clean, professional.
Use flex/grid, backdrop-filter, text-shadow.
Only <html>, <head>, <style>, <body>.
No <script>, external links, !important, position: fixed.

Return ONLY the HTML code.
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let html = response.text();

    // Убираем ```html
    html = html.replace(/```html/g, '').replace(/```/g, '').trim();

    // Заменяем плейсхолдеры на base64 (уже в preview.js)
    html = html.replace('BACKGROUND_IMAGE_URL', image_url || '');
    html = html.replace('LOGO_URL', logo_url || '');

    // Базовая валидация
    if (!html.includes('<html') || !html.includes('<style')) {
      throw new Error('Invalid HTML from Gemini');
    }

    return html;
  } catch (err) {
    console.error('Gemini error:', err.message);

    // Fallback HTML
    const bg = image_url ? `<img class="bg" src="${image_url}" />` : '';
    const logo = logo_url ? `<div class="logo-container"><img class="logo" src="${logo_url}" /></div>` : '';

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1080px;position:relative;overflow:hidden;font-family:system-ui,sans-serif;background:#000}
.bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:1}
.overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.7));z-index:2}
.logo-container{position:absolute;top:30px;left:30px;width:120px;height:120px;background:#fff;border-radius:16px;padding:8px;box-shadow:0 6px 20px rgba(0,0,0,0.5);z-index:100;display:flex;align-items:center;justify-content:center;border:3px solid #fff}
.logo{max-width:100%;max-height:100%;object-fit:contain}
.content{position:absolute;bottom:60px;left:50%;transform:translateX(-50%);color:white;text-align:center;z-index:10;max-width:88%}
.business{font-size:48px;font-weight:900;color:${brand_color || '#FF6600'};margin-bottom:16px;text-shadow:0 0 12px rgba(0,0,0,0.7)}
.text{font-size:36px;line-height:1.4;background:rgba(0,0,0,0.7);padding:26px 32px;border-radius:22px;backdrop-filter:blur(8px)}
</style></head><body>
${bg}
<div class="overlay"></div>
${logo}
<div class="content">
  <div class="business">${business_name || 'Clickify'}</div>
  <div class="text">${text.replace(/\n/g, '<br>')}</div>
</div>
</body></html>`;
  }
}
