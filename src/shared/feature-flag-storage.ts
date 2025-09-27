import { FEATURE_FLAGS_STORAGE_KEY, FeatureFlags, defaultFeatureFlags } from './feature-flags';

function mergeWithDefaults(stored: Partial<FeatureFlags> | undefined): FeatureFlags {
  return { ...defaultFeatureFlags, ...stored };
}

export async function loadFeatureFlags(): Promise<FeatureFlags> {
  return new Promise(resolve => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get([FEATURE_FLAGS_STORAGE_KEY], result => {
        const stored = result[FEATURE_FLAGS_STORAGE_KEY] as Partial<FeatureFlags> | undefined;
        resolve(mergeWithDefaults(stored));
      });
    } else {
      try {
        const raw = localStorage.getItem(FEATURE_FLAGS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<FeatureFlags>;
          resolve(mergeWithDefaults(parsed));
          return;
        }
      } catch (error) {
        console.error('Failed to load feature flags from localStorage', error);
      }
      resolve(defaultFeatureFlags);
    }
  });
}

export async function saveFeatureFlags(flags: FeatureFlags): Promise<void> {
  return new Promise(resolve => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [FEATURE_FLAGS_STORAGE_KEY]: flags }, resolve);
    } else {
      try {
        localStorage.setItem(FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(flags));
      } catch (error) {
        console.error('Failed to save feature flags to localStorage', error);
      }
      resolve();
    }
  });
}
