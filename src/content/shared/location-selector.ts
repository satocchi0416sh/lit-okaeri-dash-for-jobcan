// Location selector component for Jobcan

import { CategoryKey, isInCategory } from './categories.js';
import { loadFavorites, toggleFavorite } from './storage.js';
import { Option, escapeHtml, getOptionByValue } from './utils.js';

export interface LocationSelectorConfig {
    originalSelect: HTMLSelectElement;
    options: Option[];
    cssClasses?: {
        container?: string;
        selectedTop?: string;
    };
}

export class LocationSelector {
    private container: HTMLElement;
    private originalSelect: HTMLSelectElement;
    private options: Option[];
    private favorites: string[] = [];
    private currentCategory: string = 'all';
    private currentSearch: string = '';

    constructor(config: LocationSelectorConfig) {
        this.originalSelect = config.originalSelect;
        this.options = config.options;
        this.container = this.createContainer(config.cssClasses);
        this.init();
    }

    private async init() {
        // Hide original select
        this.originalSelect.style.display = 'none';
        
        // Insert container
        this.originalSelect.parentNode?.insertBefore(this.container, this.originalSelect.nextSibling);
        
        // Load favorites and initialize
        this.favorites = await loadFavorites();
        const selectedOption = this.options.find(opt => opt.selected);
        this.updateSelectedDisplay(selectedOption);
        this.renderList();
        this.setupEventListeners();
    }

    private createContainer(cssClasses?: LocationSelectorConfig['cssClasses']): HTMLElement {
        const container = document.createElement('div');
        const containerClass = cssClasses?.container || 'jobcan-custom-selector';
        const selectedTopClass = cssClasses?.selectedTop || 'jcs-selected-top';
        
        container.className = containerClass;
        container.innerHTML = `
            <div class="${selectedTopClass}">
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
        
        return container;
    }

    private renderList() {
        const listElement = this.container.querySelector('.jcs-list') as HTMLElement;
        listElement.innerHTML = '';
        
        const currentSelectedValue = this.originalSelect.value;
        let filteredOptions = this.getFilteredOptions();
        
        // Create list items
        filteredOptions.forEach(option => {
            const item = this.createListItem(option, currentSelectedValue);
            listElement.appendChild(item);
        });
        
        if (filteredOptions.length === 0) {
            listElement.innerHTML = '<div class="jcs-no-results">該当する打刻場所がありません</div>';
        }
    }

    private getFilteredOptions(): Option[] {
        let filteredOptions = this.options;
        
        // Category filter
        if (this.currentCategory === 'favorites') {
            filteredOptions = this.options.filter(opt => this.favorites.includes(opt.value));
        } else if (this.currentCategory !== 'all') {
            filteredOptions = this.options.filter(opt => 
                isInCategory(opt.text, this.currentCategory as CategoryKey)
            );
        }
        
        // Search filter
        if (this.currentSearch) {
            const searchLower = this.currentSearch.toLowerCase();
            filteredOptions = filteredOptions.filter(opt => 
                opt.text.toLowerCase().includes(searchLower)
            );
        }
        
        return filteredOptions;
    }

    private createListItem(option: Option, currentSelectedValue: string): HTMLElement {
        const item = document.createElement('div');
        const isSelected = option.value === currentSelectedValue;
        item.className = `jcs-list-item ${isSelected ? 'selected' : ''}`;
        
        const isFavorite = this.favorites.includes(option.value);
        
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
                this.selectOption(option.value);
            }
        });
        
        return item;
    }

    private selectOption(value: string) {
        this.originalSelect.value = value;
        
        const event = new Event('change', { bubbles: true });
        this.originalSelect.dispatchEvent(event);
        
        const selectedOption = getOptionByValue(this.options, value);
        this.updateSelectedDisplay(selectedOption);
        
        // Update visual selection state
        this.container.querySelectorAll('.jcs-list-item').forEach(item => {
            const itemText = (item.querySelector('.jcs-item-text') as HTMLElement)?.textContent;
            if (itemText === selectedOption?.text) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    private updateSelectedDisplay(option?: Option) {
        const selectedValue = this.container.querySelector('.jcs-selected-value') as HTMLElement;
        if (option) {
            selectedValue.textContent = option.text;
        }
    }

    private setupEventListeners() {
        // Tab switching
        this.container.querySelectorAll('.jcs-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.container.querySelectorAll('.jcs-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentCategory = (tab as HTMLElement).dataset.category || 'all';
                this.renderList();
            });
        });
        
        // Search input
        const searchInput = this.container.querySelector('.jcs-search-input') as HTMLInputElement;
        searchInput.addEventListener('input', (e) => {
            this.currentSearch = (e.target as HTMLInputElement).value;
            this.renderList();
        });
        
        // Favorite button clicks
        this.container.addEventListener('click', async (e) => {
            if ((e.target as HTMLElement).classList.contains('jcs-favorite-btn')) {
                e.stopPropagation();
                const value = (e.target as HTMLElement).dataset.value || '';
                this.favorites = await toggleFavorite(value);
                this.renderList();
            }
        });
    }
}

/**
 * Factory function to create a location selector
 */
export function createLocationSelector(config: LocationSelectorConfig): LocationSelector {
    return new LocationSelector(config);
}