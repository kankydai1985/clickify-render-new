// layout/ai-layout-generator.js
export async function generateLayout({ text, image_url, logo_url, brand_color, business_name, tokens, style_choice }) {
    
    // Используем токены если они есть, иначе генерируем базовые
    const designTokens = tokens || await generateBasicTokens(brand_color, business_name, style_choice);
    
    // Парсим структурированный текст как в PHP
    const sections = parseStructuredText(text);
    
    // Используем цвета из токенов для правильного контраста
    const textColor = designTokens.colors.text || '#FFFFFF';
    const backgroundColor = designTokens.colors.background || '#1a1a1a';

    // Шаблон с использованием токенов БЕЗ ХЭШТЕГОВ
    const template = `
    <div id="banner" style="
        width:1080px;height:1080px;
        position:relative;
        background:url('${image_url}') center/cover;
        font-family:${designTokens.typography.fontFamily};
        color:${textColor};
        overflow:hidden;
    ">
        <img src="${logo_url}" style="
            position:absolute;
            top:${designTokens.spacing.lg};
            left:${designTokens.spacing.lg};
            width:180px;height:180px;
            object-fit:contain;
            background:white;
            border-radius:${designTokens.effects.borderRadius};
            padding:12px;
            border:4px solid white;
            box-shadow:${designTokens.effects.shadow};
            z-index:10;
        ">
        <div style="
            position:absolute;
            top:50%;right:${designTokens.spacing.lg};
            transform:translateY(-50%);
            text-align:right;
            max-width:55%;
        ">
            <h1 style="
                font-size:72px;
                margin:0;
                color:${designTokens.colors.primary};
                text-shadow:0 4px 16px rgba(0,0,0,0.8);
                font-weight:${designTokens.typography.weight};
            ">${sections.header || business_name}</h1>
            <p style="
                font-size:42px;
                margin:${designTokens.spacing.sm} 0;
                color:${textColor};
                text-shadow:0 4px 16px rgba(0,0,0,0.8);
                font-weight:bold;
            ">${sections.body || ''}</p>
            ${sections.cta ? `<p style="font-size:32px;margin:8px 0;opacity:0.9;color:${textColor};text-shadow:0 2px 8px rgba(0,0,0,0.8);">${sections.cta}</p>` : ''}
        </div>
        <!-- ХЭШТЕГИ УБРАНЫ С ИЗОБРАЖЕНИЯ -->
    </div>`;
    
    return template;
}

// Функция парсинга структурированного текста как в PHP
function parseStructuredText(text) {
    const sections = {
        'header': '',
        'body': '',
        'cta': '',
        'hashtags': ''
    };
    
    if (!text) return sections;
    
    // Убираем все лишние тексты в начале
    const cleanedText = text.replace(/^.*?(HEADER:|BODY:|CTA:|HASHTAGS:)/s, '$1');
    
    const lines = cleanedText.split('\n');
    let currentSection = '';
    
    for (let line of lines) {
        line = line.trim();
        
        if (line.startsWith('HEADER:')) {
            currentSection = 'header';
            line = line.replace('HEADER:', '');
        } else if (line.startsWith('BODY:')) {
            currentSection = 'body';
            line = line.replace('BODY:', '');
        } else if (line.startsWith('CTA:')) {
            currentSection = 'cta';
            line = line.replace('CTA:', '');
        } else if (line.startsWith('HASHTAGS:')) {
            currentSection = 'hashtags';
            line = line.replace('HASHTAGS:', '');
        }
        
        // Добавляем текст к соответствующему разделу
        if (currentSection && line.trim()) {
            if (sections[currentSection]) {
                sections[currentSection] += ' ';
            }
            sections[currentSection] += line.trim();
        }
    }
    
    // Дополнительная очистка - убираем все возможные остатки меток
    for (let key in sections) {
        sections[key] = sections[key].trim();
        // Убираем все варианты меток в любом месте текста
        sections[key] = sections[key].replace(/(^|\s)(HEADER:|BODY:|CTA:|HASHTAGS:)\s*/gi, '');
        // Убираем лишние пробелы
        sections[key] = sections[key].replace(/\s+/g, ' ');
    }
    
    return sections;
}

async function generateBasicTokens(brandColor, businessName, styleChoice = 'auto') {
    // Базовая генерация токенов с учетом стиля
    return {
        colors: {
            primary: brandColor || '#007AFF',
            secondary: '#FFFFFF', 
            background: '#1a1a1a',
            text: '#FFFFFF',
            accent: brandColor || '#007AFF'
        },
        typography: {
            fontFamily: 'Helvetica Neue, sans-serif',
            weight: 'bold'
        },
        spacing: {
            xs: '8px',
            sm: '16px',
            md: '24px',
            lg: '32px',
            xl: '48px'
        },
        effects: {
            shadow: '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: '12px'
        },
        style: styleChoice
    };
}
