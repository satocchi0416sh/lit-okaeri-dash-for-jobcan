// Content script for Jobcan Okaeri Dash
import { createLocationSelector } from './shared/location-selector.js';
import { createOptionsFromSelect } from './shared/utils.js';
import { createWorkStatusButton } from './shared/work-status-button.js';

(() => {
    'use strict';

    // Initialize the extension
    function init() {
        const selectElement = document.getElementById('adit_group_id') as HTMLSelectElement;
        if (!selectElement) {
            console.log('打刻場所のセレクトボックスが見つかりません');
            return;
        }

        console.log('Okaeri Dash for Jobcan: 初期化開始');

        // Initialize location selector
        const options = createOptionsFromSelect(selectElement);
        createLocationSelector({
            originalSelect: selectElement,
            options: options
        });

        // Initialize work status button
        const pushButton = document.getElementById('adit-button-push') as HTMLButtonElement;
        if (pushButton) {
            createWorkStatusButton(pushButton);
            console.log('Work status button initialized');
        }
    }

    // Initialize when page is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
})();