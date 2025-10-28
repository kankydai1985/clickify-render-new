// api/preview.js
import { generateLayout } from './layout/ai-layout-generator.js';

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
  if (!text) return res.status(400).json({ error: 'Missing text' });

  try {
    const html = await generateLayout({
      text,
      image_url,  // Оставляем URL, не base64
      logo_url,
      brand_color,
      business_name,
      category,
      goal
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(html);  // Возвращаем HTML
  } catch (err) {
    console.error('Gemini failed:', err.message);
    res.status(500).json({ error: 'AI layout failed' });
  }
}

export const config = {
  api: {
    bodyParser: false
  }
};
