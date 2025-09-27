# Release Process Documentation

## 概要

このプロジェクトは、GitHub Actionsを使用した自動リリースプロセスを採用しています。mainブランチへのプッシュ時に自動的にビルド、パッケージング、GitHubリリースの作成が行われます。

## 自動リリースワークフロー

### 1. トリガー条件

- **mainブランチへのプッシュ時**に自動的にリリースワークフローが実行されます

### 2. リリースプロセス

1. コードのチェックアウト
2. 依存関係のインストール
3. Lint & Format チェック
4. ビルドの実行
5. バージョン番号の取得（package.json）
6. リリースタグの作成
7. 拡張機能のパッケージング
8. GitHubリリースの作成と成果物のアップロード

### 3. 生成される成果物

- `jobcan-okaeri-dash-vX.X.X.zip` - Chrome拡張機能パッケージ
- `source-vX.X.X.zip` - ソースコード（Chrome Web Store提出用）

## バージョン管理

### 手動バージョンアップ（推奨）

#### スクリプトを使用する場合

```bash
# パッチバージョンを上げる (1.0.0 -> 1.0.1)
node scripts/prepare-release.js patch

# マイナーバージョンを上げる (1.0.0 -> 1.1.0)
node scripts/prepare-release.js minor

# メジャーバージョンを上げる (1.0.0 -> 2.0.0)
node scripts/prepare-release.js major
```

#### 手動で更新する場合

1. `package.json`のversionフィールドを更新
2. `manifest.json`のversionフィールドを同じバージョンに更新
3. 変更をコミット

### GitHub Actions経由のバージョンアップ

GitHubのActionsタブから「Version Bump」ワークフローを手動実行：

1. Actions タブに移動
2. 「Version Bump」ワークフローを選択
3. 「Run workflow」をクリック
4. バージョンタイプ（patch/minor/major）を選択
5. 実行

これにより、バージョンアップのPRが自動作成されます。

## リリース手順

### 通常のリリース

1. **バージョンを更新**

   ```bash
   node scripts/prepare-release.js patch
   ```

2. **変更をコミット**

   ```bash
   git add -A
   git commit -m "chore: bump version to vX.X.X"
   ```

3. **mainブランチへプッシュ**

   ```bash
   git push origin main
   ```

4. **自動リリースの確認**
   - GitHub Actionsでリリースワークフローの実行を確認
   - Releasesページで新しいリリースを確認

### 緊急リリース

mainブランチに直接プッシュできない場合：

1. フィーチャーブランチで作業
2. PRを作成してmainにマージ
3. マージ時に自動リリースが実行

## CI/CD設定ファイル

### `.github/workflows/release.yml`

mainブランチへのプッシュ時に実行される自動リリースワークフロー

### `.github/workflows/version-bump.yml`

手動実行可能なバージョンアップワークフロー（PRを自動作成）

### `.github/workflows/ci.yml`

PR時のテストとビルドチェック

## トラブルシューティング

### リリースが作成されない場合

1. package.jsonのバージョンが既存のタグと重複していないか確認
2. GitHub Actionsのログでエラーを確認
3. ビルドエラーがないか確認

### パッケージングエラー

1. `npm run build`がローカルで成功するか確認
2. distフォルダが正しく生成されているか確認

### 権限エラー

1. GitHubリポジトリのSettings > Actions > General > Workflow permissions
2. 「Read and write permissions」が有効になっているか確認

## Chrome Web Store への提出

リリース成果物の`jobcan-okaeri-dash-vX.X.X.zip`を使用して、Chrome Web Storeに手動で提出します。

1. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)にアクセス
2. 拡張機能を選択
3. 新しいバージョンをアップロード
4. 必要に応じてストア掲載情報を更新
5. レビューに提出

## ベストプラクティス

1. **セマンティックバージョニング**を守る
   - MAJOR: 破壊的変更
   - MINOR: 新機能（後方互換性あり）
   - PATCH: バグ修正

2. **コミットメッセージ**は[Conventional Commits](https://www.conventionalcommits.org/)に従う

3. **リリース前チェックリスト**
   - [ ] ローカルでビルドが成功する
   - [ ] Lintエラーがない
   - [ ] manifest.jsonとpackage.jsonのバージョンが一致
   - [ ] 新機能のテストが完了

4. **リリースノート**を充実させる
   - 変更内容を明確に記載
   - Breaking changesがある場合は強調
   - ユーザー向けの説明を含める
