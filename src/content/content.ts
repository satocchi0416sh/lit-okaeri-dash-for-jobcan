// Content script for Jobcan Okaeri Dash
import { createLocationSelector } from './shared/location-selector.js';
import { createOptionsFromSelect } from './shared/utils.js';
import { createWorkStatusButton } from './shared/work-status-button.js';
import { loadFeatureFlags } from '../shared/feature-flag-storage.js';
import type { FeatureFlags } from '../shared/feature-flags.js';

(() => {
  'use strict';

  async function init() {
    const featureFlags: FeatureFlags = await loadFeatureFlags();

    const selectElement = document.getElementById('adit_group_id') as HTMLSelectElement | null;
    if (!selectElement) {
      console.log('打刻場所のセレクトボックスが見つかりません');
    }

    console.log('Okaeri Dash for Jobcan: 初期化開始', featureFlags);

    if (selectElement && featureFlags.locationSelectorMain) {
      const options = createOptionsFromSelect(selectElement);
      createLocationSelector({
        originalSelect: selectElement,
        options,
        features: {
          enableSearch: featureFlags.locationSelectorSearch,
          enableFavorites: featureFlags.locationSelectorFavorites,
          enableCategories: featureFlags.locationSelectorCategories,
          rememberLastSelection: featureFlags.locationSelectorRememberSelection,
        },
      });
    }

    if (!featureFlags.locationSelectorMain) {
      console.log('打刻場所のカスタムUIは設定で無効化されています');
    }

    if (featureFlags.workStatusButton) {
      const pushButton = document.getElementById('adit-button-push') as HTMLButtonElement | null;
      if (pushButton) {
        createWorkStatusButton(pushButton);
        console.log('Work status button initialized');
      }
    } else {
      console.log('出退勤ボタンの拡張は設定で無効化されています');
    }
  }

  const start = () => {
    init().catch(error => console.error('Jobcan Okaeri Dash initialization failed', error));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    setTimeout(start, 100);
  }
})();
