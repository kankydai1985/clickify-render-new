// layout/ai-layout-generator.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateLayout({ text, image_url, logo_url, brand_color, business_name }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
Ты — креативный дизайнер Instagram-баннеров. Создай УНИКАЛЬНЫЙ HTML-дизайн 1080x1080.

ИСПОЛЬЗУЙ:
- Фон: background-image: url('${image_url}'); background-size: cover;
- Логотип: <img src="${logo_url}" ...> (в углу)
- Текст: "${text.replace(/\n/g, ' ')}"
- Цвет бренда: ${brand_color}
- Название: "${business_name}"

ПРАВИЛА:
1. Верни ТОЛЬКО <div id="banner">...</div>
2. Используй inline CSS
3. Никаких \`\`\`html, \`\`\`
4. Уникальный стиль: градиенты, тени, анимация, расположение
5. Логотип и фон — обязательно
6. Текст — с тенью, читаемый

Пример (НЕ КОПИРУЙ):
<div id="banner" style="...">
  <img src="${logo_url}" style="position:absolute;top:40px;left:40px;width:160px;">
  <div style="position:absolute;bottom:60px;left:50%;transform:translateX(-50%);color:${brand_color};font-size:72px;">
    Скидка 20%!
  </div>
</div>

СДЕЛАЙ НЕЧТО КРЕАТИВНОЕ!
`.trim();

  try {
    const result = await model.generateContent(prompt);
    let html = (await result.response).text();
    html = html.replace(/```html/g, '').replace(/```/g, '').trim();

    // ПРОВЕРКА: ДОЛЖЕН БЫТЬ #banner, image_url, logo_url
    if (!html.includes('id="banner"') || !html.includes(image_url) || !html.includes(logo_url)) {
      throw new Error('Invalid structure');
    }

    return html;

  } catch (err) {
    console.error('Gemini design error:', err);
    // ЗАПАСНОЙ — КРАСИВЫЙ, НО СТАНДАРТНЫЙ
    return `
      <div id="banner" style="
        width:1080px;height:1080px;position:relative;overflow:hidden;
        background-image:url('${image_url}');background-size:cover;background-position:center;
        font-family:'Helvetica Neue',sans-serif;
      ">
        <img src="${logo_url}" style="
          position:absolute;top:40px;left:40px;width:160px;height:160px;
          object-fit:contain;background:white;border-radius:20px;padding:12px;
          border:4px solid white;box-shadow:0 8px 30px rgba(0,0,0,0.5);z-index:10;
        " alt="Logo">

        <div style="
          position:absolute;bottom:80px;left:50%;transform:translateX(-50%);
          text-align:center;color:white;max-width:90%;
        ">
          <h1 style="
            font-size:78px;font-weight:900;margin:0;line-height:1.1;
            color:${brand_color};text-shadow:0 6px 20px rgba(0,0,0,0.8);
          ">
            ${business_name}
          </h1>
          <p style="
            font-size:48px;margin:16px 0 0;font-weight:700;
            text-shadow:0 4px 14px rgba(0,0,0,0.8);
          ">
            ${text.split('\n')[0]}
          </p>
          <p style="
            font-size:32px;margin:8px 0 0;opacity:0.9;
            text-shadow:0 3px 10px rgba(0,0,0,0.7);
          ">
            ${text.split('\n').slice(1).join(' ')}
          </p>
        </div>

        <div style="
          position:absolute;inset:0;
          background:linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,0,0,0.6));
          pointer-events:none;
        "></div>
      </div>
    `.trim();
  }
}
