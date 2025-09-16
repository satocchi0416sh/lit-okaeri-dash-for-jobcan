// Location selector component for Jobcan

import { CategoryKey, isInCategory, getAllCategoryKeys } from './categories.js';
import { loadFavorites, toggleFavorite } from './storage.js';
import { Option, escapeHtml, getOptionByValue, createStarIcon, createSearchIcon } from './utils.js';

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
        
        // If there are favorites, select the first one automatically
        if (this.favorites.length > 0) {
            const firstFavoriteValue = this.favorites[0];
            const firstFavoriteOption = this.options.find(opt => opt.value === firstFavoriteValue);
            if (firstFavoriteOption) {
                // Update the original select value
                this.originalSelect.value = firstFavoriteValue;
                
                // Dispatch change event to notify Jobcan
                const event = new Event('change', { bubbles: true });
                this.originalSelect.dispatchEvent(event);
                
                // Update display
                this.updateSelectedDisplay(firstFavoriteOption);
            } else {
                // Fallback to the originally selected option if favorite not found
                const selectedOption = this.options.find(opt => opt.selected);
                this.updateSelectedDisplay(selectedOption);
            }
        } else {
            // No favorites, use the originally selected option
            const selectedOption = this.options.find(opt => opt.selected);
            this.updateSelectedDisplay(selectedOption);
        }
        
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
                    <button class="jcs-tab" data-category="favorites">${createStarIcon(true)} お気に入り</button>
                    ${this.generateCategoryTabs()}
                </div>
            </div>
            <div class="jcs-list-container">
                <div class="jcs-list"></div>
            </div>
        `;
        
        return container;
    }

    private generateCategoryTabs(): string {
        const categoryKeys = getAllCategoryKeys();
        return categoryKeys.map(category => 
            `<button class="jcs-tab" data-category="${category}">${category}</button>`
        ).join('');
    }

    private renderList() {
        const listElement = this.container.querySelector('.jcs-list') as HTMLElement;
        listElement.innerHTML = '';
        
        const currentSelectedValue = this.originalSelect.value;
        let filteredOptions = this.getFilteredOptions();
        
        // Add search indicator if search is active
        if (this.currentSearch.trim()) {
            const searchIndicator = document.createElement('div');
            searchIndicator.className = 'jcs-search-indicator';
            searchIndicator.innerHTML = `
                <span class="jcs-search-icon">${createSearchIcon()}</span>
                <span class="jcs-search-text">「${escapeHtml(this.currentSearch)}」の検索結果 (全体から検索)</span>
                <span class="jcs-search-count">${filteredOptions.length}件</span>
            `;
            listElement.appendChild(searchIndicator);
        }
        
        // Create list items
        filteredOptions.forEach(option => {
            const item = this.createListItem(option, currentSelectedValue);
            listElement.appendChild(item);
        });
        
        if (filteredOptions.length === 0) {
            const noResultsMsg = this.currentSearch.trim() 
                ? `「${escapeHtml(this.currentSearch)}」に一致する打刻場所がありません`
                : '該当する打刻場所がありません';
            listElement.innerHTML += `<div class="jcs-no-results">${noResultsMsg}</div>`;
        }
    }

    private getFilteredOptions(): Option[] {
        // If there's a search query, search across ALL options (ignore tab filter)
        if (this.currentSearch.trim()) {
            const searchLower = this.currentSearch.toLowerCase();
            return this.options.filter(opt => 
                opt.text.toLowerCase().includes(searchLower)
            );
        }
        
        // If no search query, apply tab filter normally
        let filteredOptions = this.options;
        
        if (this.currentCategory === 'favorites') {
            filteredOptions = this.options.filter(opt => this.favorites.includes(opt.value));
        } else if (this.currentCategory !== 'all') {
            filteredOptions = this.options.filter(opt => 
                isInCategory(opt.text, this.currentCategory as CategoryKey)
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
                    ${createStarIcon(isFavorite)}
                </button>
            </div>
        `;
        
        item.addEventListener('click', (e) => {
            if (!(e.target as HTMLElement).closest('.jcs-favorite-btn')) {
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
        
        // Favorite button clicks - use closest() to handle SVG child elements
        this.container.addEventListener('click', async (e) => {
            const favoriteBtn = (e.target as HTMLElement).closest('.jcs-favorite-btn');
            if (favoriteBtn) {
                e.stopPropagation();
                const value = (favoriteBtn as HTMLElement).dataset.value || '';
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