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
Create a 1080x1080 Instagram banner HTML with inline CSS.

- Background: <img class="bg" src="${image_url || 'https://via.placeholder.com/1080'}">
- Logo: <img class="logo" src="${logo_url || ''}">
- Text: "${text}"
- Brand color: ${brand_color || '#FF6600'}
- Business: "${business_name || 'Business'}"

Use object-fit: cover, backdrop-filter, text-shadow.
Return ONLY the HTML code.
  `.trim();

  try {
    const result = await model.generateContent(prompt);
    let html = (await result.response).text();
    html = html.replace(/```html/g, '').replace(/```/g, '').trim();

    // Вставляем base64? НЕТ — оставляем URL
    return `<div id="banner" style="width:1080px;height:1080px;overflow:hidden">${html}</div>`;
  } catch (err) {
    console.error('Gemini error:', err.message);
    return `<div id="banner" style="width:1080px;height:1080px;background:#000;color:white;display:flex;align-items:center;justify-content:center;font-family:system-ui;font-size:48px;padding:40px;text-align:center">
      ${text.replace(/\n/g, '<br>')}
    </div>`;
  }
}
