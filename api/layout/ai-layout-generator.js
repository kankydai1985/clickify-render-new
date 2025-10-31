// layout/ai-layout-generator.js
import { generateLayout } from './ai-layout-generator.js';

// Новая функция, которая использует токены
export async function generateLayoutWithTokens({ 
    text, 
    image_url, 
    logo_url, 
    brand_color, 
    business_name,
    business_type 
}) {
    
    // Генерируем токены на основе бренда
    const designTokens = await generateDesignTokens(brand_color, business_type);
    
    // Используем токены в шаблонах
    const templates = generateTemplatesWithTokens({
        text,
        image_url, 
        logo_url,
        tokens: designTokens,
        business_name
    });
    
    return templates[0]; // Пока возвращаем первый шаблон
}

async function generateDesignTokens(brandColor, businessType) {
    // Пока используем статическую генерацию
    // Позже подключим AI для оптимизации
    return {
        colors: {
            primary: brandColor,
            secondary: lightenColor(brandColor, 30),
            background: darkenColor(brandColor, 80),
            text: getContrastColor(brandColor),
            accent: generateComplementaryColor(brandColor)
        },
        typography: {
            fontFamily: getFontForBusiness(businessType),
            sizes: {
                heading: '4rem',
                subheading: '2rem',
                body: '1.125rem'
            }
        },
        spacing: {
            large: '60px',
            medium: '30px',
            small: '15px'
        }
    };
}

function generateTemplatesWithTokens({ text, image_url, logo_url, tokens, business_name }) {
    // Разбиваем текст как раньше
    const lines = text.split(/\\n|\n/).map(l => l.trim()).filter(l => l);
    const main = lines[0] || '';
    const sub = lines[1] || '';
    const hashtags = lines.slice(2).join(' ').trim();
    
    // Шаблоны теперь используют токены
    return [
        // ШАБЛОН 1 с токенами
        `
        <div id="banner" style="
            width:1080px;height:1080px;
            position:relative;
            background:url('${image_url}') center/cover;
            font-family:${tokens.typography.fontFamily};
            color:${tokens.colors.text};
        ">
            <img src="${logo_url}" style="
                position:absolute;
                top:${tokens.spacing.large};
                left:${tokens.spacing.large};
                width:200px;height:200px;
                object-fit:contain;
                background:white;
                border-radius:${tokens.effects?.borderRadius || '12px'};
                padding:16px;
                border:4px solid white;
                box-shadow:${tokens.effects?.shadow || '0 8px 32px rgba(0,0,0,0.3)'};
            ">
            <div style="
                position:absolute;
                top:50%;right:${tokens.spacing.large};
                transform:translateY(-50%);
                text-align:right;
                max-width:55%;
            ">
                <h1 style="
                    font-size:${tokens.typography.sizes.heading};
                    margin:0;
                    color:${tokens.colors.primary};
                    text-shadow:0 4px 16px rgba(0,0,0,0.8);
                ">${business_name}</h1>
                <p style="
                    font-size:${tokens.typography.sizes.subheading};
                    margin:${tokens.spacing.small} 0;
                    color:${tokens.colors.text};
                ">${main}</p>
                ${sub ? `<p style="font-size:1.5rem;margin:8px 0;opacity:0.9;">${sub}</p>` : ''}
            </div>
            ${hashtags ? `<div style="position:absolute;bottom:${tokens.spacing.large};left:50%;transform:translateX(-50%);font-size:1.25rem;color:${tokens.colors.text};">${hashtags}</div>` : ''}
        </div>
        `
    ];
}

// Вспомогательные функции для цветов
function lightenColor(color, percent) { return color; } // Заглушки
function darkenColor(color, percent) { return color; }
function getContrastColor(color) { return '#FFFFFF'; }
function generateComplementaryColor(color) { return color; }
function getFontForBusiness(businessType) { 
    const fontMap = {
        'restaurant': 'Georgia, serif',
        'tech': 'Arial, sans-serif', 
        'default': 'Helvetica Neue, sans-serif'
    };
    return fontMap[businessType] || fontMap.default;
}
