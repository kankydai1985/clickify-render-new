// layout/ai-layout-generator.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateLayout({ text, image_url, logo_url, brand_color, business_name }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // ПРОМПТ — ТОЛЬКО ТЕКСТ И СТРУКТУРА
  const prompt = `
Создай HTML-баннер 1080x1080 для Instagram.

Требования:
- Только <div> и <p> для текста
- Текст: "${text.replace(/\n/g, ' ')}"
- Название: "${business_name}"
- Цвет бренда: ${brand_color || '#FF6600'}

Стиль: современный, большой текст, тень, градиент, глубина.
Верни ТОЛЬКО <div id="content"> с inline CSS. Никаких <img>, background-image, url().
`.trim();

  try {
    const result = await model.generateContent(prompt);
    let content = (await result.response).text();
    content = content.replace(/```html/g, '').replace(/```/g, '').trim();

    // ДОБАВЛЯЕМ ФОН И ЛОГОТИП ВРУЧНУЮ
    return `
      <div id="banner" style="
        width:1080px;
        height:1080px;
        position:relative;
        overflow:hidden;
        font-family:system-ui,sans-serif;
        background-image:url('${image_url}');
        background-size:cover;
        background-position:center;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:60px;
        box-sizing:border-box;
      ">
        <!-- ЛОГОТИП -->
        <img src="${logo_url}" style="
          position:absolute;
          top:30px;
          left:30px;
          width:140px;
          height:140px;
          object-fit:contain;
          background:white;
          border-radius:16px;
          padding:8px;
          border:3px solid white;
          box-shadow:0 6px 20px rgba(0,0,0,0.5);
          z-index:10;
        ">

        <!-- ТЕКСТ ОТ GEMINI -->
        <div style="text-align:center; color:white; text-shadow: 0 4px 12px rgba(0,0,0,0.7); max-width:80%;">
          ${content}
        </div>
      </div>
    `.trim();

  } catch (err) {
    console.error('Gemini error:', err);
    // ЗАПАСНОЙ ВАРИАНТ
    return `
      <div id="banner" style="
        width:1080px;height:1080px;position:relative;overflow:hidden;
        background-image:url('${image_url}');background-size:cover;background-position:center;
        display:flex;align-items:center;justify-content:center;padding:60px;
        font-family:system-ui,sans-serif;color:white;text-shadow:0 4px 12px rgba(0,0,0,0.8);
      ">
        <img src="${logo_url}" style="
          position:absolute;top:30px;left:30px;width:140px;height:140px;
          object-fit:contain;background:white;border-radius:16px;padding:8px;
          box-shadow:0 6px 20px rgba(0,0,0,0.5);z-index:10;
        ">
        <div style="text-align:center;max-width:80%;">
          <h1 style="font-size:72px;margin:0;line-height:1.2;">${business_name}</h1>
          <p style="font-size:48px;margin:20px 0;">${text.replace(/\n/g, '<br>')}</p>
        </div>
      </div>
    `.trim();
  }
}
