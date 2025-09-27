import { useEffect, useState, useRef, useCallback } from 'react';
import type { FeatureFlags, FeatureFlagKey } from './shared/feature-flags';
import { defaultFeatureFlags } from './shared/feature-flags';
import { loadFeatureFlags, saveFeatureFlags } from './shared/feature-flag-storage';

type StatusTone = 'success' | 'error';

interface StatusMessage {
  message: string;
  tone: StatusTone;
}

interface ToggleItem {
  key: FeatureFlagKey;
  label: string;
  description?: string;
}

interface ToggleGroup {
  title: string;
  items: ToggleItem[];
}

const toggleGroups: ToggleGroup[] = [
  {
    title: '打刻画面',
    items: [
      {
        key: 'locationSelectorMain',
        label: 'カスタム打刻場所セレクター',
        description: '検索・カテゴリ・ハイライトを備えた新しい打刻場所UIを有効にします。',
      },
      {
        key: 'locationSelectorSearch',
        label: '検索ボックス',
        description: '打刻場所を文字入力で素早く絞り込みます。',
      },
      {
        key: 'locationSelectorCategories',
        label: 'カテゴリータブ',
        description: 'キャンプやスクールなどのカテゴリ別タブを表示します。',
      },
      {
        key: 'locationSelectorFavorites',
        label: 'お気に入り管理',
        description: '⭐ ボタンと「お気に入り」タブで打刻場所を保存します。',
      },
      {
        key: 'locationSelectorRememberSelection',
        label: '最後の選択を記憶',
        description: '直近に選択した打刻場所を次回の初期値として復元します。',
      },
      {
        key: 'workStatusButton',
        label: '出退勤ボタン改善',
        description: '出勤/退勤トグルと状態リセットボタンを有効化します。',
      },
    ],
  },
  {
    title: '修正画面（打刻修正）',
    items: [
      {
        key: 'modifyLocationSelector',
        label: '打刻場所セレクター強化',
        description: '修正画面にもカスタムセレクターを適用します。',
      },
      {
        key: 'modifyEditModeUi',
        label: '編集モードの視覚表示',
        description: '修正モードのバッジやフォーム強調表示を行います。',
      },
      {
        key: 'modifyDatePicker',
        label: '日付ピッカー改善',
        description: '日付入力欄と「今日」ボタンで日付を素早く変更します。',
      },
      {
        key: 'modifyTimeInputs',
        label: '時間入力フィールド改善',
        description: 'テキスト入力をネイティブの時間ピッカーに置き換えます。',
      },
    ],
  },
];

function App() {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFeatureFlags);
  const [isLoaded, setIsLoaded] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const statusTimeoutRef = useRef<number | undefined>(undefined);
  const hasHydratedRef = useRef(false);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const showStatus = useCallback((message: string, tone: StatusTone) => {
    setStatus({ message, tone });
    if (statusTimeoutRef.current) {
      window.clearTimeout(statusTimeoutRef.current);
    }
    statusTimeoutRef.current = window.setTimeout(() => setStatus(null), 3000);
  }, []);

  useEffect(() => {
    let active = true;
    loadFeatureFlags().then(loaded => {
      if (!active) return;
      setFlags(loaded);
      setIsLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }

    let cancelled = false;

    saveQueueRef.current = saveQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        try {
          await saveFeatureFlags(flags);
          if (!cancelled) {
            showStatus('設定を保存しました', 'success');
          }
        } catch (error) {
          console.error('Failed to save feature flags', error);
          if (!cancelled) {
            showStatus('設定の保存に失敗しました', 'error');
          }
          throw error;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [flags, isLoaded, showStatus]);

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        window.clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  const toggleFlag = (key: FeatureFlagKey) => {
    setFlags(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="w-96 min-h-[520px] bg-white">
      <div className="bg-gradient-to-r from-jobcan-500 to-jobcan-600 text-white p-6">
        <h1 className="text-xl font-bold mb-1">Jobcan Okaeri Dash</h1>
        <p className="text-jobcan-100 text-sm">打刻体験をカスタマイズ</p>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">充足機能のON/OFF</h2>
          <p className="text-xs text-gray-500 mb-2">
            変更はすぐに保存され、次回ページ読み込み時に反映されます。
          </p>
          {!isLoaded && <p className="text-xs text-gray-400 mb-4">設定を読み込み中です...</p>}

          {toggleGroups.map(group => (
            <div key={group.title} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">{group.title}</h3>
              <div className="space-y-4">
                {group.items.map(item => {
                  const active = flags[item.key];
                  return (
                    <div key={item.key} className="flex items-start justify-between">
                      <div className="mr-4">
                        <label className="text-sm font-medium text-gray-700">{item.label}</label>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1 leading-snug">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFlag(item.key)}
                        disabled={!isLoaded}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                          active ? 'bg-jobcan-500' : 'bg-gray-300'
                        } ${!isLoaded ? 'opacity-40 cursor-not-allowed' : ''}`}
                        aria-pressed={active}
                        aria-label={`${item.label}を${active ? '無効化' : '有効化'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {status && (
          <div
            className={`text-center text-sm py-2 px-3 rounded-md ${
              status.tone === 'success' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
            }`}
          >
            {status.message}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 p-6">
        <h3 className="text-md font-semibold text-gray-800 mb-3">使い方</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            ポップアップから必要な機能だけをON/OFF切り替えできます
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            Jobcanの打刻画面では選択した機能のみが読み込まれます
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            修正画面でも同じ設定が適用されます
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            切り替えるだけで自動保存され、対象ページをリロードすると反映されます
          </li>
        </ul>
      </div>

      <div className="border-t border-gray-100 p-4 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">Version 1.0.0 | Jobcan Okaeri Dash</p>
      </div>
    </div>
  );
}

export default App;
