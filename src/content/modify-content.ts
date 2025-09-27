// Content script for Jobcan Modify Page - Adit Modify
import { createLocationSelector } from './shared/location-selector.js';
import { createOptionsFromSelect } from './shared/utils.js';
import { loadFeatureFlags } from '../shared/feature-flag-storage.js';
import type { FeatureFlags } from '../shared/feature-flags.js';

(() => {
  'use strict';

  // Initialize the enhancements
  async function init() {
    const featureFlags: FeatureFlags = await loadFeatureFlags();
    console.log('Jobcan Edit Page Enhancements: 初期化開始', featureFlags);

    // Function to check and apply edit mode based on hash
    function checkAndApplyEditMode() {
      const isEditMode = window.location.hash.includes('#modify');

      console.log('Current URL Hash:', window.location.hash);
      console.log('Edit mode based on hash:', isEditMode);

      const form = document.querySelector('form[name="modifyForm"]') as HTMLFormElement;
      if (form) {
        const existingBadge = form.querySelector('.jce-mode-badge');
        if (existingBadge) {
          existingBadge.remove();
        }

        const existingIndicator = document.querySelector('.jce-edit-mode-indicator');
        if (existingIndicator) {
          existingIndicator.remove();
        }

        const cardElement = form.closest('.card') as HTMLElement;
        if (cardElement) {
          cardElement.classList.remove('jce-form-edit-mode');
          cardElement.style.borderColor = '';
        }

        const existingOverlay = document.querySelector('.jce-edit-overlay');
        if (existingOverlay) {
          existingOverlay.remove();
        }

        const existingCancelBtn = document.querySelector('.jce-cancel-edit');
        if (existingCancelBtn) {
          existingCancelBtn.remove();
        }

        if (isEditMode) {
          console.log('Edit mode detected from URL hash - applying visual indicators');
          applyEditModeUI(form);
        } else {
          console.log('New entry mode - standard UI');
          applyNewEntryModeUI(form);
        }
      }
    }

    if (featureFlags.modifyEditModeUi) {
      checkAndApplyEditMode();

      const onHashChange = () => {
        console.log('Hash changed, re-checking edit mode');
        checkAndApplyEditMode();
      };

      window.addEventListener('hashchange', onHashChange);

      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function (...args) {
        originalPushState.apply(history, args);
        setTimeout(checkAndApplyEditMode, 10);
      };

      history.replaceState = function (...args) {
        originalReplaceState.apply(history, args);
        setTimeout(checkAndApplyEditMode, 10);
      };
    } else {
      console.log('編集モードの視覚表示は設定で無効化されています');
    }

    if (featureFlags.modifyDatePicker) {
      enhanceDatePicker();
    } else {
      console.log('日付ピッカー改善は設定で無効化されています');
    }

    if (featureFlags.modifyTimeInputs) {
      enhanceTimeInputs();
    } else {
      console.log('時間入力フィールド改善は設定で無効化されています');
    }

    if (featureFlags.modifyLocationSelector) {
      enhanceLocationSelectors();
    } else {
      console.log('修正画面の打刻場所UIは設定で無効化されています');
    }

    // Apply edit mode visual indicators
    function applyEditModeUI(form: HTMLFormElement) {
      const cardElement = form.closest('.card');
      if (cardElement) {
        cardElement.classList.add('jce-form-edit-mode');
      }

      const timeInput = document.getElementById('ter_time') as HTMLInputElement;
      if (timeInput) {
        timeInput.classList.add('jce-editing-time');

        timeInput.addEventListener('focus', () => {
          timeInput.style.transform = 'scale(1.02)';
        });

        timeInput.addEventListener('blur', () => {
          timeInput.style.transform = 'scale(1)';
        });
      }

      const beforeModifyTime = document.getElementById('beforeModifyTime');
      if (beforeModifyTime && !beforeModifyTime.classList.contains('jce-before-value')) {
        beforeModifyTime.classList.add('jce-before-value');
      }

      const cardTitle = form.querySelector('.card-title');
      if (cardTitle) {
        const existingBadge = cardTitle.querySelector('.jce-mode-badge');
        if (existingBadge) {
          existingBadge.remove();
        }

        const badge = document.createElement('span');
        badge.className = 'jce-mode-badge edit-mode';
        badge.textContent = '修正中';
        cardTitle.appendChild(badge);
      }

      const cardElement2 = form.closest('.card') as HTMLElement;
      if (cardElement2) {
        cardElement2.style.borderColor = '#ff6b6b';
      }

      setupSubmitHandler(form);
    }

    function applyNewEntryModeUI(form: HTMLFormElement) {
      const cardTitle = form.querySelector('.card-title');
      if (cardTitle && !cardTitle.querySelector('.jce-mode-badge')) {
        const badge = document.createElement('span');
        badge.className = 'jce-mode-badge new-mode';
        badge.textContent = '新規';
        cardTitle.appendChild(badge);
      }

      const cardElement = form.closest('.card') as HTMLElement;
      if (cardElement) {
        cardElement.style.borderColor = '#007bff';
      }
    }

    function setupSubmitHandler(form: HTMLFormElement) {
      const submitButton =
        form.querySelector('#insert_button') ||
        form.querySelector('input[type="submit"], button[type="submit"]') ||
        form.querySelector('input[onclick*="adit"], button[onclick*="adit"]');

      if (submitButton) {
        submitButton.addEventListener('click', () => {
          console.log('Submit button clicked, removing #modify hash');
          if (window.location.hash.includes('#modify')) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
            console.log('Hash removed from URL');
          }
        });
      } else {
        console.log('Submit button not found for hash removal setup');
      }
    }

    function enhanceDatePicker() {
      const form = document.querySelector('form[name="form1"]') as HTMLFormElement;
      if (!form) return;

      const yearSelect = form.querySelector('select[name="year"]') as HTMLSelectElement;
      const monthSelect = form.querySelector('select[name="month"]') as HTMLSelectElement;
      const daySelect = form.querySelector('select[name="day"]') as HTMLSelectElement;

      if (!yearSelect || !monthSelect || !daySelect) return;

      const searchBox = document.getElementById('search-box');
      if (!searchBox) return;

      const dateContainer = document.createElement('div');
      dateContainer.className = 'jce-date-picker-container';

      const currentYear = yearSelect.value || new Date().getFullYear().toString();
      const currentMonth =
        monthSelect.value || (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentDay = daySelect.value || new Date().getDate().toString().padStart(2, '0');
      const currentDate = `${currentYear}-${currentMonth.padStart(2, '0')}-${currentDay.padStart(2, '0')}`;

      dateContainer.innerHTML = `
            <div class="jce-date-picker">
                <label class="jce-date-label">📅 日付選択</label>
                <input type="date" class="jce-date-input" value="${currentDate}">
                <button type="button" class="jce-today-btn">今日</button>
            </div>
        `;

      searchBox.parentNode?.insertBefore(dateContainer, searchBox);

      searchBox.style.display = 'none';

      const dateInput = dateContainer.querySelector('.jce-date-input') as HTMLInputElement;
      const todayBtn = dateContainer.querySelector('.jce-today-btn') as HTMLButtonElement;

      dateInput.addEventListener('change', () => {
        const [year, month, day] = dateInput.value.split('-');
        yearSelect.value = year;
        monthSelect.value = parseInt(month, 10).toString();
        daySelect.value = parseInt(day, 10).toString();

        form.submit();
      });

      todayBtn.addEventListener('click', () => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        dateInput.value = todayStr;
        dateInput.dispatchEvent(new Event('change'));
      });
    }

    function enhanceTimeInputs() {
      console.log('Looking for time input fields...');

      const helpTexts = document.querySelectorAll('small.jbc-text-sub');
      helpTexts.forEach(helpText => {
        const helpElement = helpText as HTMLElement;
        if (
          helpElement.innerHTML.includes('0915') ||
          helpElement.innerHTML.includes('2613') ||
          helpElement.innerHTML.includes('09時15分') ||
          helpElement.innerHTML.includes('深夜2時13分')
        ) {
          helpElement.style.display = 'none';
          console.log('Hidden time format help text');
        }
      });

      const timeNameInputs = document.querySelectorAll(
        'input[name*="time"], input[name*="Time"], input[name*="adit_time"]'
      );
      console.log('Found', timeNameInputs.length, 'inputs with time-related names');
      timeNameInputs.forEach(input => {
        console.log('Time name input:', input);
        enhanceTimeInput(input as HTMLInputElement);
      });

      const allTextInputs = document.querySelectorAll('input[type="text"]');
      console.log('Found', allTextInputs.length, 'text inputs total');

      allTextInputs.forEach((input, index) => {
        const inputElement = input as HTMLInputElement;

        if (inputElement.style.display === 'none') return;
        if (inputElement.closest('small.jbc-text-sub')) return;

        const cell = inputElement.closest('td');

        let contextText = '';
        if (cell) {
          const cellClone = cell.cloneNode(true) as HTMLElement;
          cellClone.querySelectorAll('small').forEach(small => small.remove());
          contextText = cellClone.textContent || '';
        }

        console.log(`Input ${index}:`, inputElement, 'Context:', contextText.trim());

        const isTimeField =
          (contextText.includes('時刻') && !contextText.includes('例')) ||
          contextText.includes('出勤') ||
          contextText.includes('退勤') ||
          contextText.includes('休憩') ||
          /\d{2}:\d{2}/.test(inputElement.value || '') ||
          /^\d{4}$/.test(inputElement.value || '') ||
          inputElement.maxLength === 4;

        if (isTimeField) {
          console.log('Enhanced time input field:', inputElement);
          enhanceTimeInput(inputElement);
        }
      });

      const tables = document.querySelectorAll('table');
      tables.forEach(table => {
        const timeHeaders = table.querySelectorAll('th');
        timeHeaders.forEach(header => {
          const headerText = header.textContent || '';
          if (
            (headerText.includes('時刻') || headerText.includes('時間')) &&
            !headerText.includes('例')
          ) {
            const headerIndex = Array.from(header.parentElement?.children || []).indexOf(header);
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
              const cell = row.children[headerIndex];
              if (cell) {
                const inputs = cell.querySelectorAll('input[type="text"]');
                inputs.forEach(input => {
                  if (!input.closest('small.jbc-text-sub')) {
                    console.log('Table column time input:', input);
                    enhanceTimeInput(input as HTMLInputElement);
                  }
                });
              }
            });
          }
        });
      });
    }

    function enhanceTimeInput(originalInput: HTMLInputElement) {
      if (originalInput.dataset.enhanced === 'true') return;

      originalInput.dataset.enhanced = 'true';

      const timeContainer = document.createElement('div');
      timeContainer.className = 'jce-time-picker-container';

      let currentTime = '';
      if (originalInput.value) {
        const value = originalInput.value.padStart(4, '0');
        if (value.length >= 4) {
          const hours = value.slice(-4, -2);
          const minutes = value.slice(-2);
          currentTime = `${hours}:${minutes}`;
        }
      }

      timeContainer.innerHTML = `
            <div class="jce-time-picker">
                <input type="time" class="jce-time-input" value="${currentTime}">
                <button type="button" class="jce-now-btn">現在時刻</button>
            </div>
        `;

      originalInput.parentNode?.insertBefore(timeContainer, originalInput);

      originalInput.style.display = 'none';

      const timeInput = timeContainer.querySelector('.jce-time-input') as HTMLInputElement;
      const nowBtn = timeContainer.querySelector('.jce-now-btn') as HTMLButtonElement;

      timeInput.addEventListener('change', () => {
        const [hours, minutes] = timeInput.value.split(':');
        if (hours && minutes) {
          originalInput.value = hours + minutes;
        }
      });

      nowBtn.addEventListener('click', () => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
        timeInput.dispatchEvent(new Event('change'));
      });
    }

    function enhanceLocationSelectors() {
      const locationSelects = document.querySelectorAll(
        'select[name*="group"]'
      ) as NodeListOf<HTMLSelectElement>;

      locationSelects.forEach(select => {
        if (select.options.length > 1) {
          enhanceLocationSelect(select);
        }
      });
    }

    function enhanceLocationSelect(originalSelect: HTMLSelectElement) {
      const options = createOptionsFromSelect(originalSelect);

      if (options.length <= 1) return;

      createLocationSelector({
        originalSelect,
        options,
        cssClasses: {
          container: 'jobcan-custom-selector jce-location-selector',
        },
        features: {
          enableSearch: featureFlags.locationSelectorSearch,
          enableFavorites: featureFlags.locationSelectorFavorites,
          enableCategories: featureFlags.locationSelectorCategories,
          rememberLastSelection: featureFlags.locationSelectorRememberSelection,
        },
      });
    }
  }

  const start = () => {
    init().catch(error => console.error('Jobcan Modify Page initialization failed', error));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    setTimeout(start, 100);
  }
})();
