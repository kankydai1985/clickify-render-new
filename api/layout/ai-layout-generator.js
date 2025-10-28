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
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
Ты — эксперт по дизайну рекламных баннеров 1080x1080 для Instagram/Facebook.
Создай **полный HTML-код** баннера с CSS (inline styles). Используй:

- Фон: ${image_url ? 'изображение как фон (src="'но в base64)' : 'градиент'}
- Логотип: ${logo_url ? 'в верхнем левом углу' : 'без логотипа'}
- Текст: "${text}"
- Цвет бренда: ${brand_color || '#FF6600'}
- Бизнес: ${business_name || 'Clickify'}
- Категория: ${category || 'услуги'}
- Цель: ${goal || 'увеличить продажи'}

Требования:
- Размер: 1080x1080
- Адаптивно
- Красивый шрифт (system-ui)
- Тень, градиент, blur
- Текст читаемый
- Только <style> и <body>, без <script>
- Замени BACKGROUND_IMAGE_URL на ${image_url || 'none'}
- Замени LOGO_URL на ${logo_url || 'none'}

Верни **ТОЛЬКО HTML-строку**, без \`\`\`html.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let html = response.text();

    // Очистка от ```html
    html = html.replace(/```html/g, '').replace(/```/g, '').trim();

    // Замена плейсхолдеров на base64 (Puppeteer увидит base64)
    if (image_url) html = html.replace('BACKGROUND_IMAGE_URL', image_url);
    if (logo_url) html = html.replace('LOGO_URL', logo_url);

    // Базовая валидация
    if (!html.includes('<html') || !html.includes('<style')) {
      throw new Error('Invalid HTML from Gemini');
    }

    return html;
  } catch (err) {
    console.error('Gemini error:', err.message);
    
    // Fallback — твой красивый шаблон
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
