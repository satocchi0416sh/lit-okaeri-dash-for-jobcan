// Content script for Jobcan Okaeri Dash
import { createLocationSelector } from './shared/location-selector.js';
import { createOptionsFromSelect } from './shared/utils.js';

(() => {
    'use strict';

    // Initialize the extension
    function init() {
        const selectElement = document.getElementById('adit_group_id') as HTMLSelectElement;
        if (!selectElement) {
            console.log('打刻場所のセレクトボックスが見つかりません');
            return;
        }

        console.log('Jobcan Okaeri Dash: 初期化開始');

        const options = createOptionsFromSelect(selectElement);
        createLocationSelector({
            originalSelect: selectElement,
            options: options
        });
    }

    // Initialize when page is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
})();