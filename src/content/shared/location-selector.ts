// Location selector component for Jobcan

import { CategoryKey, isInCategory, getAllCategoryKeys } from './categories.js';
import { loadFavorites, toggleFavorite, loadLastSelected, saveLastSelected } from './storage.js';
import { Option, escapeHtml, getOptionByValue, createStarIcon, createSearchIcon } from './utils.js';

type CategoryFilterKey = CategoryKey | 'all' | 'favorites';

export interface LocationSelectorFeatures {
  enableSearch: boolean;
  enableFavorites: boolean;
  enableCategories: boolean;
  rememberLastSelection: boolean;
}

const DEFAULT_FEATURES: LocationSelectorFeatures = {
  enableSearch: true,
  enableFavorites: true,
  enableCategories: true,
  rememberLastSelection: true,
};

export interface LocationSelectorConfig {
  originalSelect: HTMLSelectElement;
  options: Option[];
  cssClasses?: {
    container?: string;
    selectedTop?: string;
  };
  features?: Partial<LocationSelectorFeatures>;
}

export class LocationSelector {
  private container: HTMLElement;
  private originalSelect: HTMLSelectElement;
  private options: Option[];
  private favorites: string[] = [];
  private currentCategory: CategoryFilterKey = 'all';
  private currentSearch: string = '';
  private features: LocationSelectorFeatures;

  constructor(config: LocationSelectorConfig) {
    this.originalSelect = config.originalSelect;
    this.options = config.options;
    this.features = {
      ...DEFAULT_FEATURES,
      ...config.features,
    };
    this.container = this.createContainer(config.cssClasses);
    this.init();
  }

  private async init() {
    // Hide original select
    this.originalSelect.style.display = 'none';

    // Insert container
    this.originalSelect.parentNode?.insertBefore(this.container, this.originalSelect.nextSibling);

    // Load favorites and last selected location based on feature toggles
    if (this.features.enableFavorites) {
      this.favorites = await loadFavorites();
    } else {
      this.favorites = [];
    }

    const lastSelected = this.features.rememberLastSelection ? await loadLastSelected() : null;

    // Determine initial selection priority:
    // 1. Last selected (if it exists in options)
    // 2. First favorite (if exists and feature enabled)
    // 3. Originally selected option

    let initialOption: Option | undefined;

    if (lastSelected) {
      initialOption = this.options.find(opt => opt.value === lastSelected);
      if (initialOption) {
        console.log('Using last selected location:', initialOption.text);
      }
    }

    if (!initialOption && this.features.enableFavorites && this.favorites.length > 0) {
      const firstFavoriteValue = this.favorites[0];
      initialOption = this.options.find(opt => opt.value === firstFavoriteValue);
      if (initialOption) {
        console.log('Using first favorite location:', initialOption.text);
      }
    }

    if (!initialOption) {
      initialOption = this.options.find(opt => opt.selected);
      if (initialOption) {
        console.log('Using originally selected location:', initialOption.text);
      }
    }

    if (initialOption) {
      this.originalSelect.value = initialOption.value;
      const event = new Event('change', { bubbles: true });
      this.originalSelect.dispatchEvent(event);
      this.updateSelectedDisplay(initialOption);
    }

    this.renderList();
    this.setupEventListeners();
  }

  private createContainer(cssClasses?: LocationSelectorConfig['cssClasses']): HTMLElement {
    const container = document.createElement('div');
    const containerClass = cssClasses?.container || 'jobcan-custom-selector';
    const selectedTopClass = cssClasses?.selectedTop || 'jcs-selected-top';

    container.className = containerClass;

    const headerSections: string[] = [];

    if (this.features.enableSearch) {
      headerSections.push(`
        <div class="jcs-search-box">
          <input type="text" class="jcs-search-input" placeholder="打刻場所を検索...">
        </div>
      `);
    }

    if (this.features.enableFavorites || this.features.enableCategories) {
      const tabs: string[] = ['<button class="jcs-tab active" data-category="all">すべて</button>'];

      if (this.features.enableFavorites) {
        tabs.push(
          `<button class="jcs-tab" data-category="favorites">${createStarIcon(true)} お気に入り</button>`
        );
      }

      if (this.features.enableCategories) {
        tabs.push(this.generateCategoryTabs());
      }

      headerSections.push(`<div class="jcs-tabs">${tabs.join('')}</div>`);
    }

    const headerHtml =
      headerSections.length > 0 ? `<div class="jcs-header">${headerSections.join('')}</div>` : '';

    container.innerHTML = `
      <div class="${selectedTopClass}">
        <span class="jcs-selected-label">現在選択中の打刻場所</span>
        <span class="jcs-selected-value"></span>
      </div>
      ${headerHtml}
      <div class="jcs-list-container">
        <div class="jcs-list"></div>
      </div>
    `;

    return container;
  }

  private generateCategoryTabs(): string {
    const categoryKeys = getAllCategoryKeys();
    return categoryKeys
      .map(category => `<button class="jcs-tab" data-category="${category}">${category}</button>`)
      .join('');
  }

  private renderList() {
    if (!this.features.enableFavorites && this.currentCategory === 'favorites') {
      this.currentCategory = 'all';
    }
    if (
      !this.features.enableCategories &&
      this.currentCategory !== 'all' &&
      this.currentCategory !== 'favorites'
    ) {
      this.currentCategory = 'all';
    }

    const listElement = this.container.querySelector('.jcs-list') as HTMLElement;
    listElement.innerHTML = '';

    const currentSelectedValue = this.originalSelect.value;
    const filteredOptions = this.getFilteredOptions();

    const shouldShowSearchIndicator = this.features.enableSearch && this.currentSearch.trim();
    if (shouldShowSearchIndicator) {
      const searchIndicator = document.createElement('div');
      searchIndicator.className = 'jcs-search-indicator';
      searchIndicator.innerHTML = `
        <span class="jcs-search-icon">${createSearchIcon()}</span>
        <span class="jcs-search-text">「${escapeHtml(this.currentSearch)}」の検索結果 (全体から検索)</span>
        <span class="jcs-search-count">${filteredOptions.length}件</span>
      `;
      listElement.appendChild(searchIndicator);
    }

    filteredOptions.forEach(option => {
      const item = this.createListItem(option, currentSelectedValue);
      listElement.appendChild(item);
    });

    if (filteredOptions.length === 0) {
      const noResultsMsg = shouldShowSearchIndicator
        ? `「${escapeHtml(this.currentSearch)}」に一致する打刻場所がありません`
        : '該当する打刻場所がありません';
      listElement.innerHTML += `<div class="jcs-no-results">${noResultsMsg}</div>`;
    }
  }

  private getFilteredOptions(): Option[] {
    if (this.features.enableSearch && this.currentSearch.trim()) {
      const searchLower = this.currentSearch.toLowerCase();
      return this.options.filter(opt => opt.text.toLowerCase().includes(searchLower));
    }

    let filteredOptions = this.options;

    if (this.features.enableFavorites && this.currentCategory === 'favorites') {
      filteredOptions = this.options.filter(opt => this.favorites.includes(opt.value));
    } else if (this.features.enableCategories && this.currentCategory !== 'all') {
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

    const isFavorite = this.features.enableFavorites && this.favorites.includes(option.value);

    const favoriteButtonHtml = this.features.enableFavorites
      ? `<button type="button" class="jcs-favorite-btn ${isFavorite ? 'active' : ''}" 
            data-value="${option.value}" 
            title="${isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}">
            ${createStarIcon(isFavorite)}
        </button>`
      : '';

    item.innerHTML = `
      <div class="jcs-item-content">
        <span class="jcs-item-text">${escapeHtml(option.text)}</span>
        ${favoriteButtonHtml}
      </div>
    `;

    item.addEventListener('click', e => {
      if (!(e.target as HTMLElement).closest('.jcs-favorite-btn')) {
        this.selectOption(option.value);
      }
    });

    return item;
  }

  private async selectOption(value: string) {
    this.originalSelect.value = value;

    const event = new Event('change', { bubbles: true });
    this.originalSelect.dispatchEvent(event);

    const selectedOption = getOptionByValue(this.options, value);
    this.updateSelectedDisplay(selectedOption);

    if (this.features.rememberLastSelection) {
      await saveLastSelected(value);
      console.log('Saved last selected location:', selectedOption?.text);
    }

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
    const tabs = this.container.querySelectorAll('.jcs-tab');
    if (tabs.length > 0) {
      tabs.forEach(tab => {
        tab.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
          this.container.querySelectorAll('.jcs-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.currentCategory = ((tab as HTMLElement).dataset.category ||
            'all') as CategoryFilterKey;
          this.renderList();
        });
      });
    }

    if (this.features.enableSearch) {
      const searchInput = this.container.querySelector(
        '.jcs-search-input'
      ) as HTMLInputElement | null;
      if (searchInput) {
        searchInput.addEventListener('input', e => {
          this.currentSearch = (e.target as HTMLInputElement).value;
          this.renderList();
        });
      }
    }

    if (this.features.enableFavorites) {
      this.container.addEventListener('click', async e => {
        const favoriteBtn = (e.target as HTMLElement).closest('.jcs-favorite-btn');
        if (favoriteBtn) {
          e.preventDefault();
          e.stopPropagation();
          const value = (favoriteBtn as HTMLElement).dataset.value || '';
          this.favorites = await toggleFavorite(value);
          this.renderList();
        }
      });
    }
  }
}

/**
 * Factory function to create a location selector
 */
export function createLocationSelector(config: LocationSelectorConfig): LocationSelector {
  return new LocationSelector(config);
}
