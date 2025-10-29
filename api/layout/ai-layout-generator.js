// layout/ai-layout-generator.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateLayout({ text, image_url, logo_url, brand_color, business_name }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // НЕ ПЕРЕДАЁМ image_url В ПРОМПТ!
  const prompt = `
Ты — дизайнер Instagram-баннеров. Создай HTML 1080x1080.

Требования:
- Фон: background-image: url('${image_url}'); background-size: cover;
- Логотип: <img src="${logo_url}" style="position:absolute;top:30px;left:30px;width:140px;height:140px;object-fit:contain;background:white;border-radius:16px;padding:8px;border:3px solid white;box-shadow:0 6px 20px rgba(0,0,0,0.5)">
- Текст: "${text.replace(/\n/g, ' ')}"
- Цвет бренда: ${brand_color || '#FF6600'}
- Название: "${business_name}"

Стиль: современный, тень у текста, градиент, глубина.
Верни ТОЛЬКО <div id="banner"> с inline CSS.
`.trim();

  try {
    const result = await model.generateContent(prompt);
    let html = (await result.response).text();
    html = html.replace(/```html/g, '').replace(/```/g, '').trim();

    // ДОБАВЛЯЕМ ФОН ВРУЧНУЮ
    return `
      <div id="banner" style="width:1080px;height:1080px;position:relative;overflow:hidden;font-family:system-ui,sans-serif;background-image:url('${image_url}');background-size:cover;background-position:center;">
        ${html}
        <img src="${logo_url}" style="position:absolute;top:30px;left:30px;width:140px;height:140px;object-fit:contain;background:white;border-radius:16px;padding:8px;border:3px solid white;box-shadow:0 6px 20px rgba(0,0,0,0.5);z-index:10;">
      </div>
    `.trim();
  } catch (err) {
    console.error('Gemini error:', err);
    return `
      <div id="banner" style="width:1080px;height:1080px;background:#111;color:white;display:flex;align-items:center;justify-content:center;font-size:48px;padding:40px;text-align:center;background:linear-gradient(135deg, #333, #000);">
        ${text.replace(/\n/g, '<br>')}
        <div style="position:absolute;top:30px;left:30px;">
          <img src="${logo_url}" style="width:140px;height:140px;object-fit:contain;background:white;border-radius:16px;padding:8px;">
        </div>
      </div>
    `;
  }
}
