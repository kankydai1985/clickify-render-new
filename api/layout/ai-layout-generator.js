// layout/ai-layout-generator.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateLayout({ text, image_url, logo_url, brand_color, business_name }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
Ты — гениальный дизайнер Instagram-баннеров. Создай УНИКАЛЬНЫЙ, КРЕАТИВНЫЙ HTML 1080x1080.

ОБЯЗАТЕЛЬНО:
- Фон: background-image: url('${image_url}'); background-size: cover;
- Логотип: <img src="${logo_url}" style="position:absolute;...">
- Цвет бренда: ${brand_color} — используй в заголовке
- Текст: "${text.replace(/\n/g, ' ')}"
- Название: "${business_name}"

ВЕРНИ ТОЛЬКО:
<div id="banner" style="...">
  <!-- Логотип -->
  <img src="${logo_url}" style="...">
  <!-- Текст -->
  <div style="...">...</div>
</div>

ПРАВИЛА:
1. НИКАКИХ \`\`\`html
2. Уникальное расположение: не по центру!
3. Градиенты, тени, анимация, повороты
4. Логотип — в углу, с тенью
5. Текст — с эффектом глубины

СДЕЛАЙ ЧТО-ТО НЕОБЫЧНОЕ! НЕ КОПИРУЙ СТАНДАРТ!
`.trim();

  try {
    const result = await model.generateContent(prompt);
    let html = (await result.response).text();
    html = html.replace(/```html/g, '').replace(/```/g, '').trim();

    // ЖЁСТКАЯ ПРОВЕРКА
    const hasBanner = /id=["']banner["']/.test(html);
    const hasBg = new RegExp(image_url).test(html);
    const hasLogo = new RegExp(logo_url).test(html);
    const hasBrandColor = new RegExp(brand_color).test(html);

    if (!hasBanner || !hasBg || !hasLogo || !hasBrandColor) {
      throw new Error('Gemini ignored rules');
    }

    return html;

  } catch (err) {
    console.error('Gemini failed to follow rules:', err);
    // КРАСИВЫЙ УНИКАЛЬНЫЙ FALLBACK
    return `
      <div id="banner" style="
        width:1080px;height:1080px;position:relative;overflow:hidden;
        background-image:url('${image_url}');background-size:cover;background-position:center;
        font-family:'Arial Black',sans-serif;
      ">
        <!-- ЛОГОТИП С ПОВОРОТОМ -->
        <img src="${logo_url}" style="
          position:absolute;top:60px;left:-40px;width:220px;height:220px;
          object-fit:contain;background:white;border-radius:30px;padding:16px;
          border:6px solid white;transform:rotate(-12deg);
          box-shadow:0 12px 40px rgba(0,0,0,0.6);z-index:10;
        " alt="Logo">

        <!-- ТЕКСТ С ГРАДИЕНТОМ -->
        <div style="
          position:absolute;top:50%;right:40px;transform:translateY(-50%);
          text-align:right;max-width:55%;color:transparent;
          background:linear-gradient(45deg, ${brand_color}, #ffffff);
          -webkit-background-clip:text;background-clip:text;
          text-shadow:0 4px 20px rgba(0,0,0,0.5);
        ">
          <h1 style="font-size:82px;margin:0;line-height:1;font-weight:900;">
            ${business_name}
          </h1>
          <p style="font-size:48px;margin:12px 0 0;font-weight:700;">
            ${text.split('\n')[0]}
          </p>
        </div>

        <!-- ХЭШТЕГИ ВНИЗУ -->
        <div style="
          position:absolute;bottom:60px;left:50%;transform:translateX(-50%);
          font-size:36px;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,0.7);
          background:rgba(0,0,0,0.4);padding:12px 32px;border-radius:50px;
        ">
          ${text.split('#').slice(1).join(' #')}
        </div>

        <!-- ГРАДИЕНТ -->
        <div style="position:absolute;inset:0;background:radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.5));pointer-events:none;"></div>
      </div>
    `.trim();
  }
}
