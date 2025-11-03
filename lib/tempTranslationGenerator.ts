// Temporary solution to generate Chinese translations for testing
// This creates basic Chinese translations by copying English structure

export const generateChineseTranslations = (englishTranslations: any): any => {
    // Basic Chinese translations for common keys
    const chineseMap: Record<string, string> = {
        // Common UI elements
        'Search': '搜索',
        'Home': '首页',
        'Login': '登录',
        'Sign Up': '注册',
        'Logout': '退出',
        'Profile': '个人资料',
        'Settings': '设置',
        'Book Now': '立即预订',
        'View Profile': '查看资料',
        'Loading...': '加载中...',
        'Save': '保存',
        'Cancel': '取消',
        'Confirm': '确认',
        'Close': '关闭',
        
        // Landing page
        'Welcome': '欢迎',
        'Select Language': '选择语言',
        'Enter App': '进入应用',
        'Choose your language': '选择您的语言',
        
        // Home page
        'Home Service': '上门服务',
        'Massage Places': '按摩场所',
        'Nearby Therapists': '附近的治疗师',
        'No therapists found': '未找到治疗师',
        'Set Location': '设置位置',
        'Your Location': '您的位置',
        'Distance away': '距离',
        'per session': '每次',
        'From': '从',
        
        // Common phrases
        'therapists online': '位治疗师在线',
        'of': '的',
        'and': '和',
        'or': '或',
        'in': '在',
        'at': '在',
        'for': '为',
        'with': '与',
        'to': '到',
        'from': '从'
    };
    
    const translateText = (text: string): string => {
        // Direct translation if available
        if (chineseMap[text]) {
            return chineseMap[text];
        }
        
        // Handle template strings with placeholders
        if (text.includes('{count}') && text.includes('{total}')) {
            if (text.includes('therapists online')) {
                return '{total}位治疗师中有{count}位在线';
            }
        }
        
        // For complex strings, try partial matching
        for (const [eng, chi] of Object.entries(chineseMap)) {
            if (text.includes(eng)) {
                return text.replace(eng, chi);
            }
        }
        
        // Fallback: return original text with Chinese indicator
        return `[CN] ${text}`;
    };
    
    const translateObject = (obj: any): any => {
        if (typeof obj === 'string') {
            return translateText(obj);
        }
        
        if (Array.isArray(obj)) {
            return obj.map(translateObject);
        }
        
        if (obj && typeof obj === 'object') {
            const translated: any = {};
            for (const [key, value] of Object.entries(obj)) {
                translated[key] = translateObject(value);
            }
            return translated;
        }
        
        return obj;
    };
    
    return translateObject(englishTranslations);
};

// Generate translations for other languages too
export const generateTranslationsForLanguage = (englishTranslations: any, targetLang: string): any => {
    console.log(`🔧 Generating translations for language: ${targetLang}`);
    console.log(`📝 Input English translations keys:`, Object.keys(englishTranslations || {}));
    
    const languageMaps: Record<string, Record<string, string>> = {
        'zh': { // Chinese
            'Search': '搜索',
            'Home': '首页',
            'Login': '登录',
            'Sign Up': '注册',
            'Book Now': '立即预订',
            'Loading...': '加载中...',
            'Home Service': '上门服务',
            'Massage Places': '按摩场所',
            'Login / Sign Up': '登录 / 注册',
            'Nearby Therapists': '附近的治疗师',
            'Nearby Massage Places': '附近的按摩场所',
            'Set Location': '设置位置',
            'Your Location': '您的位置',
            'Select Location': '选择位置',
            'therapists online': '位治疗师在线',
            'No therapists found in your area': '您所在地区未找到治疗师',
            'No massage places found in your area': '您所在地区未找到按摩场所',
            'away': '距离',
            'per session': '每次',
            'From': '从',
            'View Profile': '查看资料',
            'WhatsApp': '微信',
            'Rating': '评分'
        },
        'ja': { // Japanese
            'Search': '検索',
            'Home': 'ホーム',
            'Login': 'ログイン',
            'Book Now': '今すぐ予約',
            'Loading...': '読み込み中...'
        },
        'ko': { // Korean
            'Search': '검색',
            'Home': '홈',
            'Login': '로그인',
            'Book Now': '지금 예약',
            'Loading...': '로딩 중...'
        },
        'es': { // Spanish
            'Search': 'Buscar',
            'Home': 'Inicio',
            'Login': 'Iniciar sesión',
            'Book Now': 'Reservar ahora',
            'Loading...': 'Cargando...'
        },
        'fr': { // French
            'Search': 'Rechercher',
            'Home': 'Accueil',
            'Login': 'Se connecter',
            'Book Now': 'Réserver maintenant',
            'Loading...': 'Chargement...'
        }
    };
    
    const map = languageMaps[targetLang] || {};
    
    const translateText = (text: string): string => {
        // Direct translation if available
        if (map[text]) {
            return map[text];
        }
        
        // Handle template strings with placeholders
        if (text.includes('{count}') && text.includes('{total}')) {
            if (text.includes('therapists online')) {
                return '{total}位治疗师中有{count}位在线';
            }
        }
        
        // For complex strings, try partial matching
        for (const [eng, trans] of Object.entries(map)) {
            if (text.includes(eng)) {
                return text.replace(eng, trans);
            }
        }
        
        // Fallback: return original text with language indicator
        return `[${targetLang.toUpperCase()}] ${text}`;
    };
    
    const translateObject = (obj: any): any => {
        if (typeof obj === 'string') {
            return translateText(obj);
        }
        
        if (Array.isArray(obj)) {
            return obj.map(translateObject);
        }
        
        if (obj && typeof obj === 'object') {
            const translated: any = {};
            for (const [key, value] of Object.entries(obj)) {
                translated[key] = translateObject(value);
            }
            return translated;
        }
        
        return obj;
    };
    
    console.log(`🔧 Generating translations for ${targetLang} from:`, englishTranslations);
    const result = translateObject(englishTranslations);
    console.log(`✅ Generated structure for ${targetLang}:`, Object.keys(result));
    return result;
};