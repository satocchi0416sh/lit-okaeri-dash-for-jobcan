// Storage utilities for managing favorites

const FAVORITES_KEY = 'jobcanFavorites';

/**
 * お気に入りをストレージから読み込み
 */
export async function loadFavorites(): Promise<string[]> {
  return new Promise(resolve => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([FAVORITES_KEY], result => {
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
  return new Promise(resolve => {
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
 * 最後に選択した打刻場所のキー
 */
const LAST_SELECTED_KEY = 'jobcan_last_selected_location';

/**
 * 最後に選択した打刻場所を保存
 */
export async function saveLastSelected(value: string): Promise<void> {
  return new Promise(resolve => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ [LAST_SELECTED_KEY]: value }, resolve);
    } else {
      // フォールバック: localStorage
      localStorage.setItem(LAST_SELECTED_KEY, value);
      resolve();
    }
  });
}

/**
 * 最後に選択した打刻場所を読み込み
 */
export async function loadLastSelected(): Promise<string | null> {
  return new Promise(resolve => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([LAST_SELECTED_KEY], result => {
        resolve(result[LAST_SELECTED_KEY] || null);
      });
    } else {
      // フォールバック: localStorage
      const value = localStorage.getItem(LAST_SELECTED_KEY);
      resolve(value);
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
