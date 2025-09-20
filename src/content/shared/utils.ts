// Utility functions
import { Star, Search } from 'lucide-static';

export interface Option {
  value: string;
  text: string;
  selected: boolean;
}

/**
 * HTMLエスケープ
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * selectボックスからOptionオブジェクトの配列を作成
 */
export function createOptionsFromSelect(selectElement: HTMLSelectElement): Option[] {
  return Array.from(selectElement.options).map(opt => ({
    value: opt.value,
    text: opt.text,
    selected: opt.selected,
  }));
}

/**
 * 現在選択されているオプションを取得
 */
export function getSelectedOption(options: Option[]): Option | undefined {
  return options.find(opt => opt.selected);
}

/**
 * 指定した値のオプションを取得
 */
export function getOptionByValue(options: Option[], value: string): Option | undefined {
  return options.find(opt => opt.value === value);
}

/**
 * Star icon utility using lucide-static
 */
export function createStarIcon(filled: boolean = false): string {
  // Replace attributes in the Star SVG string
  const baseIcon = Star;

  if (filled) {
    return baseIcon
      .replace('width="24"', 'width="16"')
      .replace('height="24"', 'height="16"')
      .replace('class="lucide lucide-star"', 'class="lucide lucide-star jcs-star-icon"')
      .replace('fill="none"', 'fill="#f59e0b"')
      .replace('stroke="currentColor"', 'stroke="#f59e0b"');
  } else {
    return baseIcon
      .replace('width="24"', 'width="16"')
      .replace('height="24"', 'height="16"')
      .replace('class="lucide lucide-star"', 'class="lucide lucide-star jcs-star-icon"');
  }
}

/**
 * Search icon utility using lucide-static
 */
export function createSearchIcon(): string {
  // Replace attributes in the Search SVG string
  return Search.replace('width="24"', 'width="16"')
    .replace('height="24"', 'height="16"')
    .replace('class="lucide lucide-search"', 'class="lucide lucide-search jcs-search-icon-svg"');
}
