import { useState, useEffect } from 'react';

interface Settings {
  enabled: boolean;
  showFavorites: boolean;
  defaultCategory: string;
}

function App() {
  const [settings, setSettings] = useState<Settings>({
    enabled: true,
    showFavorites: true,
    defaultCategory: 'all',
  });
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['jobcanSettings'], result => {
        if (result.jobcanSettings) {
          setSettings(result.jobcanSettings);
        }
      });
    }
  }, []);

  const saveSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ jobcanSettings: settings }, () => {
        setStatus('設定を保存しました');
        setTimeout(() => setStatus(''), 3000);
      });
    } else {
      setStatus('Chrome拡張機能として実行してください');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const handleToggle = (key: keyof Settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      defaultCategory: e.target.value,
    }));
  };

  return (
    <div className="w-96 min-h-[500px] bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-jobcan-500 to-jobcan-600 text-white p-6">
        <h1 className="text-xl font-bold mb-1">Jobcan Okaeri Dash</h1>
        <p className="text-jobcan-100 text-sm">打刻場所選択UIを改善</p>
      </div>

      {/* Settings Section */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">拡張機能設定</h2>

        <div className="space-y-4">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">カスタムUIを有効にする</label>
            <button
              onClick={() => handleToggle('enabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enabled ? 'bg-jobcan-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Favorites Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">お気に入りタブを表示</label>
            <button
              onClick={() => handleToggle('showFavorites')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showFavorites ? 'bg-jobcan-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showFavorites ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Default Category */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              デフォルトカテゴリ
            </label>
            <select
              value={settings.defaultCategory}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-jobcan-500 focus:border-jobcan-500"
            >
              <option value="all">すべて</option>
              <option value="favorites">お気に入り</option>
              <option value="キャンプ">キャンプ</option>
              <option value="スクール">スクール</option>
              <option value="イベント">イベント</option>
              <option value="リーダーズ">リーダーズ</option>
              <option value="コーポレート">コーポレート</option>
              <option value="その他">その他</option>
            </select>
          </div>

          {/* Save Button */}
          <button
            onClick={saveSettings}
            className="w-full bg-jobcan-500 hover:bg-jobcan-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            設定を保存
          </button>

          {/* Status Message */}
          {status && (
            <div className="text-center text-sm text-green-600 bg-green-50 py-2 px-3 rounded-md">
              {status}
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="border-t border-gray-100 p-6">
        <h3 className="text-md font-semibold text-gray-800 mb-3">使い方</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            Jobcanの打刻画面で自動的にカスタムUIが表示されます
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            ⭐アイコンをクリックしてお気に入りに追加
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            カテゴリータブで素早くフィルタリング
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            検索ボックスで打刻場所を検索
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-4 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">Version 1.0.0 | Jobcan Okaeri Dash</p>
      </div>
    </div>
  );
}

export default App;
