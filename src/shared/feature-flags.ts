export interface FeatureFlags {
  locationSelectorMain: boolean;
  locationSelectorSearch: boolean;
  locationSelectorCategories: boolean;
  locationSelectorFavorites: boolean;
  locationSelectorRememberSelection: boolean;
  workStatusButton: boolean;
  modifyLocationSelector: boolean;
  modifyEditModeUi: boolean;
  modifyDatePicker: boolean;
  modifyTimeInputs: boolean;
}

export type FeatureFlagKey = keyof FeatureFlags;

export const FEATURE_FLAGS_STORAGE_KEY = 'jobcanFeatureFlags';

export const defaultFeatureFlags: FeatureFlags = {
  locationSelectorMain: true,
  locationSelectorSearch: true,
  locationSelectorCategories: true,
  locationSelectorFavorites: true,
  locationSelectorRememberSelection: true,
  workStatusButton: true,
  modifyLocationSelector: true,
  modifyEditModeUi: true,
  modifyDatePicker: true,
  modifyTimeInputs: true,
};
