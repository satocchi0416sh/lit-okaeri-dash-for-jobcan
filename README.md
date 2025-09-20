# Okaeri Dash for Jobcan

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Extension-green" alt="Chrome Extension">
  <img src="https://img.shields.io/badge/TypeScript-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" alt="React">
</p>

Jobcanの打刻システムをLife is Tech!向けにより使いやすくするChrome拡張機能です。

## ✨ 主な機能

### 🏢 打刻場所セレクター

- **リッチなUI**: ドロップダウンをモダンなカード型UIに変更
- **お気に入り機能**: よく使う打刻場所をお気に入りに登録
- **カテゴリ分類**: キャンプ、スクール、イベントなどのカテゴリごとに表示
- **リアルタイム検索**: 打刻場所を素早く検索
- **自動選択**: お気に入りの打刻場所を自動選択

### ⏰ 出勤ステータスボタン

- **ビジュアル表示**: 緑の再生ボタン（出勤）/ 赤の停止ボタン（退勤）
- **状態管理**: ローカルストレージで出勤状態を保持
- **自動リセット**: 日付が変わると自動的にリセット
- **手動リセット**: 必要に応じて手動でリセット可能

### 📝 打刻修正ページの改善

- **日付ピッカー**: カレンダーUIで簡単に日付選択
- **時刻ピッカー**: HTML5の時刻入力フィールドで入力を簡単に
- **現在時刻ボタン**: ワンクリックで現在時刻を入力

## 📦 インストール方法

### 開発者モードでインストール

1. このリポジトリをクローンまたはダウンロード

```bash
git clone https://github.com/yourusername/okaeri-dash-for-jobcan.git
cd okaeri-dash-for-jobcan
```

2. 依存関係をインストールしてビルド

> **Node.js/npmがまだインストールされていない方へ**
>
> - **公式サイト**: [Node.js公式サイト](https://nodejs.org/ja/) からLTS版をダウンロード
> - **インストール手順**:
>   - [Windows向け詳細手順](https://qiita.com/echolimitless/items/83f8658cf855de04b9ce)
>   - [Mac向け詳細手順](https://qiita.com/kyosuke5_20/items/c5f68fc9d89b84c0df09)
>   - [パッケージマネージャーでのインストール](https://nodejs.org/ja/download/package-manager/)
> - **バージョン管理ツール**: [nvm](https://github.com/nvm-sh/nvm) (複数バージョンの管理に便利)

```bash
npm install
npm run build
```

3. Chromeで拡張機能を読み込む
   - Chrome で `chrome://extensions/` を開く
   - 右上の「デベロッパーモード」をオンにする
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - `dist` フォルダを選択

4. Jobcanのページを開いて機能を確認

## 🔧 開発環境のセットアップ

### 必要な環境

- Node.js 18.0.0 以上
- npm 8.0.0 以上
- Chrome ブラウザ

### 開発を始める

1. リポジトリをクローン

```bash
git clone https://github.com/yourusername/okaeri-dash-for-jobcan.git
cd okaeri-dash-for-jobcan
```

2. 依存関係をインストール

```bash
npm install
```

3. 開発サーバーを起動

```bash
npm run dev
```

4. ファイル変更を監視しながらビルド

```bash
npm run build:watch
```

### プロジェクト構成

```
okaeri-dash-for-jobcan/
├── src/
│   ├── content/           # コンテンツスクリプト
│   │   ├── shared/         # 共通モジュール
│   │   │   ├── categories.ts      # カテゴリ管理
│   │   │   ├── location-selector.ts # 打刻場所セレクター
│   │   │   ├── storage.ts         # ストレージ管理
│   │   │   ├── utils.ts           # ユーティリティ関数
│   │   │   └── work-status-button.ts # 出勤ステータスボタン
│   │   ├── content.ts      # メインページ用スクリプト
│   │   ├── modify-content.ts # 修正ページ用スクリプト
│   │   └── styles.css      # スタイルシート
│   └── popup/             # ポップアップUI（React）
├── dist/                  # ビルド出力
├── vite.config.ts        # Vite設定
├── tailwind.config.js    # Tailwind CSS設定
└── package.json
```

### 技術スタック

- **TypeScript**: 型安全な開発
- **Vite**: 高速なビルドツール
- **React**: ポップアップUIの構築
- **Tailwind CSS**: スタイリング
- **Lucide Icons**: アイコンライブラリ

## 🚀 ビルドとデプロイ

### プロダクションビルド

```bash
npm run build
```

### 開発用ビルド（ウォッチモード）

```bash
npm run build:watch
```

### 型チェック

```bash
npx tsc --noEmit
```

## 🤝 コントリビューション

**あなたの貢献を歓迎します！** 🎉

このプロジェクトをより良くするために、ぜひご協力ください。バグ報告、機能提案、コードの改善など、どんな貢献も大歓迎です。

### 貢献の方法

1. **Issue を作成する**
   - バグを見つけた場合
   - 新機能のアイデアがある場合
   - ドキュメントの改善提案

2. **プルリクエストを送る**
   - Fork してローカルで開発
   - 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
   - 変更をコミット (`git commit -m 'feat: add amazing feature'`)
   - ブランチをプッシュ (`git push origin feature/amazing-feature`)
   - プルリクエストを作成

### コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/) を使用しています：

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント変更
- `style:` コードスタイルの変更
- `refactor:` リファクタリング
- `test:` テストの追加・修正
- `chore:` ビルドプロセスなどの変更

## 📄 ライセンス

MIT License

## 🙏 謝辞

このプロジェクトは以下のオープンソースプロジェクトを使用しています。

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

## 📧 お問い合わせ

質問や提案がある場合は、[Issues](https://github.com/satocchi0416sh/lit-okaeri-dash-for-jobcan/issues) でお知らせください。

---

**⚠️ 注意事項**

- この拡張機能は非公式のツールです
- Jobcanのアップデートにより動作しなくなる可能性があります
- 業務に支障が出た場合は、拡張機能を無効化してください

---

Made with ❤️ for better work-life balance
