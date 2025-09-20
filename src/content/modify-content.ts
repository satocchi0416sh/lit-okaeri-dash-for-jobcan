// Content script for Jobcan Modify Page - Adit Modify
import { createLocationSelector } from './shared/location-selector.js';
import { createOptionsFromSelect } from './shared/utils.js';

(() => {
  'use strict';

  // Initialize the enhancements
  function init() {
    console.log('Jobcan Edit Page Enhancements: 初期化開始');

    // Function to check and apply edit mode based on hash
    function checkAndApplyEditMode() {
      const isEditMode = window.location.hash.includes('#modify');

      console.log('Current URL Hash:', window.location.hash);
      console.log('Edit mode based on hash:', isEditMode);

      const form = document.querySelector('form[name="modifyForm"]') as HTMLFormElement;
      if (form) {
        // Remove existing badges first
        const existingBadge = form.querySelector('.jce-mode-badge');
        if (existingBadge) {
          existingBadge.remove();
        }

        // Remove existing indicators
        const existingIndicator = document.querySelector('.jce-edit-mode-indicator');
        if (existingIndicator) {
          existingIndicator.remove();
        }

        // Remove form highlighting
        const cardElement = form.closest('.card') as HTMLElement;
        if (cardElement) {
          cardElement.classList.remove('jce-form-edit-mode');
          cardElement.style.borderColor = '';
        }

        // Remove overlay
        const existingOverlay = document.querySelector('.jce-edit-overlay');
        if (existingOverlay) {
          existingOverlay.remove();
        }

        // Remove cancel button
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

    // Initial check
    checkAndApplyEditMode();

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      console.log('Hash changed, re-checking edit mode');
      checkAndApplyEditMode();
    });

    // Also listen for URL changes via history API (in case hash is added programmatically)
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

    // Enhance date picker
    enhanceDatePicker();

    // Enhance time inputs
    enhanceTimeInputs();

    // Enhance location selectors
    enhanceLocationSelectors();
  }

  // Apply edit mode visual indicators
  function applyEditModeUI(form: HTMLFormElement) {
    // Add form highlighting
    const cardElement = form.closest('.card');
    if (cardElement) {
      cardElement.classList.add('jce-form-edit-mode');
    }

    // Highlight the time input field
    const timeInput = document.getElementById('ter_time') as HTMLInputElement;
    if (timeInput) {
      timeInput.classList.add('jce-editing-time');

      // Add focus effect
      timeInput.addEventListener('focus', () => {
        timeInput.style.transform = 'scale(1.02)';
      });

      timeInput.addEventListener('blur', () => {
        timeInput.style.transform = 'scale(1)';
      });
    }

    // Style the before/after display
    const beforeModifyTime = document.getElementById('beforeModifyTime');
    if (beforeModifyTime && !beforeModifyTime.classList.contains('jce-before-value')) {
      beforeModifyTime.classList.add('jce-before-value');
    }

    // Remove any existing "new" badge and add/update mode badge to card title
    const cardTitle = form.querySelector('.card-title');
    if (cardTitle) {
      // Remove existing badges
      const existingBadge = cardTitle.querySelector('.jce-mode-badge');
      if (existingBadge) {
        existingBadge.remove();
      }

      // Add edit mode badge
      const badge = document.createElement('span');
      badge.className = 'jce-mode-badge edit-mode';
      badge.textContent = '修正中';
      cardTitle.appendChild(badge);
    }

    // Change the border color to red for edit mode
    const cardElement2 = form.closest('.card') as HTMLElement;
    if (cardElement2) {
      cardElement2.style.borderColor = '#ff6b6b';
    }

    // Setup form submit handler to remove hash
    setupSubmitHandler(form);
  }

  // Apply new entry mode visual indicators
  function applyNewEntryModeUI(form: HTMLFormElement) {
    // Add mode badge to card title
    const cardTitle = form.querySelector('.card-title');
    if (cardTitle && !cardTitle.querySelector('.jce-mode-badge')) {
      const badge = document.createElement('span');
      badge.className = 'jce-mode-badge new-mode';
      badge.textContent = '新規';
      cardTitle.appendChild(badge);
    }

    // Clean UI for new entry
    const cardElement = form.closest('.card') as HTMLElement;
    if (cardElement) {
      cardElement.style.borderColor = '#007bff';
    }
  }

  // Setup submit handler to remove #modify hash
  function setupSubmitHandler(form: HTMLFormElement) {
    // Look for the specific submit button with id="insert_button"
    // which is the actual submit button on the modify page
    const submitButton =
      form.querySelector('#insert_button') ||
      form.querySelector('input[type="submit"], button[type="submit"]') ||
      form.querySelector('input[onclick*="adit"], button[onclick*="adit"]');

    if (submitButton) {
      submitButton.addEventListener('click', () => {
        console.log('Submit button clicked, removing #modify hash');
        // Remove the #modify hash from URL
        if (window.location.hash.includes('#modify')) {
          history.replaceState(null, '', window.location.pathname + window.location.search);
          console.log('Hash removed from URL');
        }
      });
    } else {
      console.log('Submit button not found for hash removal setup');
    }
  }

  // Enhance date picker with instant navigation
  function enhanceDatePicker() {
    const form = document.querySelector('form[name="form1"]') as HTMLFormElement;
    if (!form) return;

    const yearSelect = form.querySelector('select[name="year"]') as HTMLSelectElement;
    const monthSelect = form.querySelector('select[name="month"]') as HTMLSelectElement;
    const daySelect = form.querySelector('select[name="day"]') as HTMLSelectElement;

    if (!yearSelect || !monthSelect || !daySelect) return;

    // Find the search-box container that holds the date selectors
    const searchBox = document.getElementById('search-box');
    if (!searchBox) return;

    // Create modern date picker
    const dateContainer = document.createElement('div');
    dateContainer.className = 'jce-date-picker-container';

    // Get current values
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

    // Insert the new date picker before the search-box
    searchBox.parentNode?.insertBefore(dateContainer, searchBox);

    // Hide the entire search-box (includes all original calendar elements)
    searchBox.style.display = 'none';

    // Setup event listeners
    const dateInput = dateContainer.querySelector('.jce-date-input') as HTMLInputElement;
    const todayBtn = dateContainer.querySelector('.jce-today-btn') as HTMLButtonElement;

    dateInput.addEventListener('change', () => {
      const [year, month, day] = dateInput.value.split('-');
      yearSelect.value = year;
      monthSelect.value = parseInt(month, 10).toString();
      daySelect.value = parseInt(day, 10).toString();

      // Auto-submit the form
      form.submit();
    });

    todayBtn.addEventListener('click', () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      dateInput.value = todayStr;
      dateInput.dispatchEvent(new Event('change'));
    });
  }

  // Enhance time inputs with proper time pickers
  function enhanceTimeInputs() {
    console.log('Looking for time input fields...');

    // First, hide the help text elements that contain example formats
    const helpTexts = document.querySelectorAll('small.jbc-text-sub');
    helpTexts.forEach(helpText => {
      const helpElement = helpText as HTMLElement;
      // Check if this contains the time format examples
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

    // Strategy 1: Look for inputs with specific names that indicate time
    const timeNameInputs = document.querySelectorAll(
      'input[name*="time"], input[name*="Time"], input[name*="adit_time"]'
    );
    console.log('Found', timeNameInputs.length, 'inputs with time-related names');
    timeNameInputs.forEach(input => {
      console.log('Time name input:', input);
      enhanceTimeInput(input as HTMLInputElement);
    });

    // Strategy 2: Look for all text inputs and check their context
    const allTextInputs = document.querySelectorAll('input[type="text"]');
    console.log('Found', allTextInputs.length, 'text inputs total');

    allTextInputs.forEach((input, index) => {
      const inputElement = input as HTMLInputElement;

      // Skip if already enhanced
      if (inputElement.style.display === 'none') return;

      // Skip if this is within a help text element
      if (inputElement.closest('small.jbc-text-sub')) return;

      // Check the immediate parent cell, not the entire row to avoid help text
      const cell = inputElement.closest('td');

      let contextText = '';
      if (cell) {
        // Get only the direct text content, not from nested elements
        const cellClone = cell.cloneNode(true) as HTMLElement;
        // Remove small elements (help text)
        cellClone.querySelectorAll('small').forEach(small => small.remove());
        contextText = cellClone.textContent || '';
      }

      console.log(`Input ${index}:`, inputElement, 'Context:', contextText.trim());

      // More precise time field detection - look for actual time labels, not help text
      const isTimeField =
        (contextText.includes('時刻') && !contextText.includes('例')) ||
        contextText.includes('出勤') ||
        contextText.includes('退勤') ||
        contextText.includes('休憩') ||
        /\d{2}:\d{2}/.test(inputElement.value || '') || // Current value is HH:MM
        /^\d{4}$/.test(inputElement.value || '') || // Current value is 4 digits
        inputElement.maxLength === 4; // Common for HHMM format

      if (isTimeField) {
        console.log('Enhanced time input field:', inputElement);
        enhanceTimeInput(inputElement);
      }
    });

    // Strategy 3: Look for inputs in specific table structures
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      const timeHeaders = table.querySelectorAll('th');
      timeHeaders.forEach(header => {
        const headerText = header.textContent || '';
        if (
          (headerText.includes('時刻') || headerText.includes('時間')) &&
          !headerText.includes('例')
        ) {
          // Find inputs in the same column
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
    // Skip if already enhanced
    if (originalInput.dataset.enhanced === 'true') return;

    // Mark as enhanced to prevent duplicates
    originalInput.dataset.enhanced = 'true';

    // Create time picker container
    const timeContainer = document.createElement('div');
    timeContainer.className = 'jce-time-picker-container';

    // Parse current value (e.g., "0915" -> "09:15")
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

    // Insert before original input
    originalInput.parentNode?.insertBefore(timeContainer, originalInput);

    // Hide original input
    originalInput.style.display = 'none';

    // Setup event listeners
    const timeInput = timeContainer.querySelector('.jce-time-input') as HTMLInputElement;
    const nowBtn = timeContainer.querySelector('.jce-now-btn') as HTMLButtonElement;

    timeInput.addEventListener('change', () => {
      const [hours, minutes] = timeInput.value.split(':');
      if (hours && minutes) {
        // Convert back to Jobcan format (e.g., "09:15" -> "0915")
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

  // Enhance location selectors with the same UI as main page
  function enhanceLocationSelectors() {
    const locationSelects = document.querySelectorAll(
      'select[name*="group"]'
    ) as NodeListOf<HTMLSelectElement>;

    locationSelects.forEach(select => {
      if (select.options.length > 1) {
        // Has actual options
        enhanceLocationSelect(select);
      }
    });
  }

  function enhanceLocationSelect(originalSelect: HTMLSelectElement) {
    const options = createOptionsFromSelect(originalSelect);

    if (options.length <= 1) return; // Skip if no real options

    createLocationSelector({
      originalSelect: originalSelect,
      options: options,
      cssClasses: {
        container: 'jobcan-custom-selector jce-location-selector',
      },
    });
  }

  // Initialize when page is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
})();
