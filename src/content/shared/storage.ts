// Storage utilities for managing favorites

const FAVORITES_KEY = 'jobcanFavorites';

/**
 * お気に入りをストレージから読み込み
 */
export async function loadFavorites(): Promise<string[]> {
    return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get([FAVORITES_KEY], (result) => {
                resolve(result[FAVORITES_KEY] || []);
            });
        } else {
            // フォールバック: localStorage
            const stored = localStorage.getItem(FAVORITES_KEY);
            resolve(stored ? JSON.parse(stored) : []);
        }
    });
}

/**
 * お気に入りをストレージに保存
 */
export async function saveFavorites(favorites: string[]): Promise<void> {
    return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ [FAVORITES_KEY]: favorites }, resolve);
        } else {
            // フォールバック: localStorage
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
            resolve();
        }
    });
}

/**
 * お気に入りの追加/削除を切り替え
 */
export async function toggleFavorite(value: string): Promise<string[]> {
    const favorites = await loadFavorites();
    const index = favorites.indexOf(value);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(value);
    }
    
    await saveFavorites(favorites);
    return favorites;
}