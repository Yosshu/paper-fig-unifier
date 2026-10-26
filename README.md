# Paper Fig Unifier

論文の副図（subfigure）を、**同じピクセルサイズに一括で切り抜いて ZIP でダウンロード**できるブラウザツールです。

**公開ページ:** https://yosshu.github.io/paper-fig-unifier/

[English below](#english)

## 特長

- **切り取るだけなので画質が落ちない** — 拡大縮小をしないので、図の中の文字や線の太さが全画像で揃います。ピクセルはそのままコピーされます。
- **画像はアップロードされない** — すべてブラウザ内で処理します。未発表の図も安心して扱えます。
- **PNG・JPG・SVG に対応** — SVG は倍率（×1〜×4）を選んで画像にしてから切り取ります。
- **日本語 / English** を切り替えられます。

## 使い方

1. 副図の画像をページにまとめてドロップします（「ファイルを選択」でも可）。ファイル名順に (a), (b), (c)… と並びます。
2. 出力サイズを決めます。
   - **最小サイズ**（初期設定）：全画像の最小の幅 × 最小の高さ。必ず切り取りだけで揃います。
   - **最大サイズ**：全画像の最大の幅 × 最大の高さ。小さい画像には余白が入ります。
   - **手入力**：幅と高さを px で指定します。
3. **基準点**（9 点）で、どこを残して切り取るかを選びます。
4. 必要ならプレビューの白い枠をドラッグして、画像ごとに位置を微調整します（枠を選んで矢印キーで 1 px、Shift + 矢印キーで 10 px）。
5. 書き出し形式とファイル名を選び、「ZIP で一括ダウンロード」を押します。

設定はブラウザに保存され、次に開いたときも同じ設定で使えます。

## 仕様と注意点

- 画像が出力サイズより小さい場合は、足りない部分に余白（白・透明・指定色）を追加します。PNG 自体の透明部分はそのまま残ります。
- JPG は透明にできないため、透明を選んだ場合の余白は白になります。また、JPG は保存し直すたびに少し劣化します（初期品質 95）。
- 「元のまま」で書き出すと、PNG は PNG、JPG は JPG、SVG は PNG になります。
- 書き出し時に色は sRGB になり、EXIF などのメタデータは含まれません。
- SVG が外部の画像やフォントを参照している場合、それらは読み込まれません（ブラウザの制約）。
- 非常に大きなサイズ（約 1,600 万ピクセル超）は、ブラウザによっては書き出せないことがあります。

## 開発

Node.js 22 以降が必要です。

```sh
npm ci          # 依存関係のインストール
npm run dev     # 開発サーバー (http://localhost:5173)
npm test        # テスト (Vitest)
npm run lint    # Lint (oxlint)
npm run build   # 本番ビルド (dist/)
```

構成：Vite + React + TypeScript。ZIP 作成に [fflate](https://github.com/101arrowz/fflate) を使っています。

```
src/
  lib/         切り取り位置の計算・SVG サイズ解析・ファイル名・書き出し（主に純粋関数とテスト）
  components/  画面の部品
  i18n.ts      日本語 / 英語の文言
  App.tsx      状態管理と画面全体
```

## GitHub Pages への公開

`main` ブランチに push すると、GitHub Actions（`.github/workflows/deploy.yml`）がビルドして公開します。

初回のみ、リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定してください。

## 今後の予定

- 余白の自動トリム（余白を除いた「内容」を基準に揃える）
- 画像ごとの基準点（グラフの原点などを揃える）
- ドラッグでの並べ替え

---

<a id="english"></a>

## English

Paper Fig Unifier is a browser tool that **crops paper subfigures to the exact same pixel size and downloads them as one ZIP**.

- **Crop only, no resampling** — text and line widths stay consistent across subfigures, and pixels are copied as-is.
- **Nothing is uploaded** — everything runs in your browser.
- **PNG, JPG and SVG** — SVG is rendered at a chosen scale (×1–×4) before cropping.
- **Japanese / English** UI.

### How to use

1. Drop your subfigure images onto the page (or use "Choose files"). They are sorted by file name and labelled (a), (b), (c)…
2. Choose the output size: **Smallest** (default; every image is only cropped), **Largest** (smaller images get padding) or **Custom**.
3. Pick the **anchor** (9 positions) that decides which part is kept.
4. Optionally drag a crop frame to fine-tune a single image (or focus it and use the arrow keys: 1 px, Shift for 10 px).
5. Choose the format and file names, then click "Download as ZIP".

### Notes

- Images smaller than the output are padded (white, transparent or a custom color); a PNG's own transparency is kept.
- JPG cannot be transparent, so transparent padding becomes white. "Keep" exports PNG as PNG, JPG as JPG and SVG as PNG.
- Exports are sRGB without EXIF metadata. External resources referenced by an SVG are not loaded.
- Very large sizes (above about 16 million pixels) may fail to export in some browsers.

### Development

```sh
npm ci && npm run dev   # then npm test / npm run lint / npm run build
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`. Set **Settings → Pages → Source** to **GitHub Actions** once.
