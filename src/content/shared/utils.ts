// Utility functions

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
        selected: opt.selected
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