// layout/ai-layout-generator.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateLayout({ text, image_url, logo_url, brand_color, business_name }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
Ты — дизайнер Instagram-баннеров. Создай ТОЛЬКО ТЕКСТОВЫЙ КОНТЕНТ для баннера 1080x1080.

Требования:
- Только <h1>, <p>, <div> с текстом
- Текст: "${text.replace(/\n/g, ' ')}"
- Название: "${business_name}"
- Цвет бренда: ${brand_color || '#FF6600'}

Стиль: большой заголовок, подзаголовок, тень, градиент.
Верни ТОЛЬКО HTML-код внутри <div id="content">. Никаких <img>, background, url().
Пример:
<div id="content" style="text-align:center;padding:60px;color:white;">
  <h1 style="font-size:72px;margin:0;text-shadow:0 4px 12px rgba(0,0,0,0.7);">Скидка 20%</h1>
  <p style="font-size:48px;margin:20px 0;">Только до конца недели!</p>
</div>
`.trim();

  try {
    const result = await model.generateContent(prompt);
    let content = (await result.response).text();
    content = content.replace(/```html/g, '').replace(/```/g, '').trim();

    // ВСЁ ОСТАЛЬНОЕ — ВРУЧНУЮ
    return `
      <div id="banner" style="
        width:1080px;height:1080px;position:relative;overflow:hidden;
        background-image:url('${image_url}');background-size:cover;background-position:center;
        font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;
        padding:80px;box-sizing:border-box;
      ">
        <!-- ЛОГОТИП -->
        <img src="${logo_url}" style="
          position:absolute;top:30px;left:30px;width:140px;height:140px;
          object-fit:contain;background:white;border-radius:16px;padding:8px;
          border:3px solid white;box-shadow:0 6px 20px rgba(0,0,0,0.6);z-index:10;
        " alt="Logo">

        <!-- ТЕКСТ ОТ GEMINI -->
        <div style="text-align:center;color:white;text-shadow:0 4px 16px rgba(0,0,0,0.8);max-width:85%;">
          ${content}
        </div>
      </div>
    `.trim();

  } catch (err) {
    console.error('Gemini error:', err);
    // ЗАПАСНОЙ — НИКОГДА НЕ ДОЛЖЕН СРАБОТАТЬ
    return `
      <div id="banner" style="
        width:1080px;height:1080px;position:relative;overflow:hidden;
        background-image:url('${image_url}');background-size:cover;background-position:center;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        padding:80px;font-family:system-ui,sans-serif;color:white;text-align:center;
      ">
        <img src="${logo_url}" style="
          position:absolute;top:30px;left:30px;width:140px;height:140px;
          object-fit:contain;background:white;border-radius:16px;padding:8px;
          box-shadow:0 6px 20px rgba(0,0,0,0.6);z-index:10;
        ">
        <h1 style="font-size:72px;margin:0;line-height:1.1;text-shadow:0 4px 16px rgba(0,0,0,0.8);">
          ${business_name}
        </h1>
        <p style="font-size:48px;margin:20px 0;text-shadow:0 4px 16px rgba(0,0,0,0.8);">
          ${text.replace(/\n/g, '<br>')}
        </p>
      </div>
    `.trim();
  }
}
