// Content script for Jobcan Okaeri Dash
(() => {
    'use strict';

    // Category definitions
    const CATEGORIES = {
        'キャンプ': ['サマーキャンプ', '夏キャンプ', 'camp'],
        'スクール': ['ライフイズテックスクール', 'スクール名古屋', 'school'],
        'イベント': ['アプリ甲子園', '自主開催イベント', 'イベント', 'event', '1Day', '2DAY'],
        'リーダーズ': ['Leaders', 'リーダーズ'],
        'コーポレート': ['コーポレート', 'セキュリティ研修'],
        'その他': []
    };

    interface Option {
        value: string;
        text: string;
        selected: boolean;
    }

    // Initialize the extension
    function init() {
        const selectElement = document.getElementById('adit_group_id') as HTMLSelectElement;
        if (!selectElement) {
            console.log('打刻場所のセレクトボックスが見つかりません');
            return;
        }

        console.log('Jobcan Okaeri Dash: 初期化開始');

        const options: Option[] = Array.from(selectElement.options).map(opt => ({
            value: opt.value,
            text: opt.text,
            selected: opt.selected
        }));

        createCustomLocationSelector(selectElement, options);
    }

    // Create custom selector UI
    function createCustomLocationSelector(originalSelect: HTMLSelectElement, options: Option[]) {
        originalSelect.style.display = 'none';

        const container = document.createElement('div');
        container.className = 'jobcan-custom-selector';
        container.innerHTML = `
            <div class="jcs-selected-top">
                <span class="jcs-selected-label">現在選択中の打刻場所</span>
                <span class="jcs-selected-value"></span>
            </div>
            <div class="jcs-header">
                <div class="jcs-search-box">
                    <input type="text" class="jcs-search-input" placeholder="打刻場所を検索...">
                </div>
                <div class="jcs-tabs">
                    <button class="jcs-tab active" data-category="all">すべて</button>
                    <button class="jcs-tab" data-category="favorites">⭐ お気に入り</button>
                    <button class="jcs-tab" data-category="キャンプ">キャンプ</button>
                    <button class="jcs-tab" data-category="スクール">スクール</button>
                    <button class="jcs-tab" data-category="イベント">イベント</button>
                    <button class="jcs-tab" data-category="リーダーズ">リーダーズ</button>
                    <button class="jcs-tab" data-category="コーポレート">コーポレート</button>
                    <button class="jcs-tab" data-category="その他">その他</button>
                </div>
            </div>
            <div class="jcs-list-container">
                <div class="jcs-list"></div>
            </div>
        `;

        originalSelect.parentNode?.insertBefore(container, originalSelect.nextSibling);

        loadFavorites().then(favorites => {
            const selectedOption = options.find(opt => opt.selected);
            updateSelectedDisplay(container, selectedOption);
            renderList(container, options, favorites, 'all', '');
            setupEventListeners(container, originalSelect, options, favorites);
        });
    }

    // Render the list items
    function renderList(container: HTMLElement, options: Option[], favorites: string[], category: string, searchText: string) {
        const listElement = container.querySelector('.jcs-list') as HTMLElement;
        listElement.innerHTML = '';

        // Get current selected value from the original select element
        const originalSelect = document.getElementById('adit_group_id') as HTMLSelectElement;
        const currentSelectedValue = originalSelect.value;

        let filteredOptions = options;

        // Category filter
        if (category === 'favorites') {
            filteredOptions = options.filter(opt => favorites.includes(opt.value));
        } else if (category !== 'all') {
            filteredOptions = options.filter(opt => {
                const text = opt.text.toLowerCase();
                const keywords = CATEGORIES[category as keyof typeof CATEGORIES] || [];
                if (keywords.length === 0) {
                    return !Object.keys(CATEGORIES).some(cat => {
                        if (cat === 'その他') return false;
                        return CATEGORIES[cat as keyof typeof CATEGORIES].some(keyword =>
                            text.includes(keyword.toLowerCase())
                        );
                    });
                }
                return keywords.some(keyword => text.includes(keyword.toLowerCase()));
            });
        }

        // Search filter
        if (searchText) {
            const searchLower = searchText.toLowerCase();
            filteredOptions = filteredOptions.filter(opt =>
                opt.text.toLowerCase().includes(searchLower)
            );
        }

        // Create list items
        filteredOptions.forEach(option => {
            const item = document.createElement('div');
            const isSelected = option.value === currentSelectedValue;
            item.className = `jcs-list-item ${isSelected ? 'selected' : ''}`;

            const isFavorite = favorites.includes(option.value);

            item.innerHTML = `
                <div class="jcs-item-content">
                    <span class="jcs-item-text">${escapeHtml(option.text)}</span>
                    <button class="jcs-favorite-btn ${isFavorite ? 'active' : ''}" 
                            data-value="${option.value}" 
                            title="${isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}">
                        ${isFavorite ? '⭐' : '☆'}
                    </button>
                </div>
            `;

            item.addEventListener('click', (e) => {
                if (!(e.target as HTMLElement).classList.contains('jcs-favorite-btn')) {
                    selectOption(container, option.value, options);
                }
            });

            listElement.appendChild(item);
        });

        if (filteredOptions.length === 0) {
            listElement.innerHTML = '<div class="jcs-no-results">該当する打刻場所がありません</div>';
        }
    }

    // Select an option
    function selectOption(container: HTMLElement, value: string, options: Option[]) {
        const originalSelect = document.getElementById('adit_group_id') as HTMLSelectElement;
        originalSelect.value = value;

        const event = new Event('change', { bubbles: true });
        originalSelect.dispatchEvent(event);

        const selectedOption = options.find(opt => opt.value === value);
        updateSelectedDisplay(container, selectedOption);

        // Update visual selection state for all items
        container.querySelectorAll('.jcs-list-item').forEach(item => {
            const itemText = (item.querySelector('.jcs-item-text') as HTMLElement)?.textContent;
            if (itemText === selectedOption?.text) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // Update selected display
    function updateSelectedDisplay(container: HTMLElement, option?: Option) {
        const selectedValue = container.querySelector('.jcs-selected-value') as HTMLElement;
        if (option) {
            selectedValue.textContent = option.text;
        }
    }

    // Setup event listeners
    function setupEventListeners(container: HTMLElement, _originalSelect: HTMLSelectElement, options: Option[], favorites: string[]) {
        let currentCategory = 'all';
        let currentSearch = '';

        container.querySelectorAll('.jcs-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.jcs-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentCategory = (tab as HTMLElement).dataset.category || 'all';
                renderList(container, options, favorites, currentCategory, currentSearch);
            });
        });

        const searchInput = container.querySelector('.jcs-search-input') as HTMLInputElement;
        searchInput.addEventListener('input', (e) => {
            currentSearch = (e.target as HTMLInputElement).value;
            renderList(container, options, favorites, currentCategory, currentSearch);
        });

        container.addEventListener('click', async (e) => {
            if ((e.target as HTMLElement).classList.contains('jcs-favorite-btn')) {
                e.stopPropagation();
                const value = (e.target as HTMLElement).dataset.value || '';
                const index = favorites.indexOf(value);

                if (index > -1) {
                    favorites.splice(index, 1);
                } else {
                    favorites.push(value);
                }

                await saveFavorites(favorites);
                renderList(container, options, favorites, currentCategory, currentSearch);
            }
        });
    }

    // Load favorites from storage
    async function loadFavorites(): Promise<string[]> {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.get(['jobcanFavorites'], (result) => {
                    resolve(result.jobcanFavorites || []);
                });
            } else {
                const stored = localStorage.getItem('jobcanFavorites');
                resolve(stored ? JSON.parse(stored) : []);
            }
        });
    }

    // Save favorites to storage
    async function saveFavorites(favorites: string[]): Promise<void> {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({ jobcanFavorites: favorites }, resolve);
            } else {
                localStorage.setItem('jobcanFavorites', JSON.stringify(favorites));
                resolve();
            }
        });
    }

    // HTML escape utility
    function escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize when page is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
})();