// Category definitions for Jobcan location classification

export const CATEGORIES = {
    'キャンプ': ['サマーキャンプ', '夏キャンプ', 'camp'],
    'スクール': ['ライフイズテックスクール', 'スクール名古屋', 'school'],
    'DX': ['DX', 'dx'],
    'イベント': ['アプリ甲子園', '自主開催イベント', 'イベント', 'event', '1Day', '2DAY'],
    'リーダーズ': ['Leaders', 'リーダーズ'],
    'コーポレート': ['コーポレート', 'セキュリティ研修'],
    'その他': []
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

/**
 * 指定されたテキストがカテゴリに属するかどうかを判定
 */
export function isInCategory(text: string, category: CategoryKey): boolean {
    const normalizedText = text.toLowerCase();
    const keywords = CATEGORIES[category];
    
    if (keywords.length === 0) {
        // "その他"カテゴリの場合は、他のどのカテゴリにも属さないものを返す
        return !Object.keys(CATEGORIES).some(cat => {
            if (cat === 'その他') return false;
            return CATEGORIES[cat as CategoryKey].some(keyword => 
                normalizedText.includes(keyword.toLowerCase())
            );
        });
    }
    
    return keywords.some(keyword => normalizedText.includes(keyword.toLowerCase()));
}

/**
 * すべてのカテゴリ名を取得
 */
export function getAllCategoryKeys(): CategoryKey[] {
    return Object.keys(CATEGORIES) as CategoryKey[];
}