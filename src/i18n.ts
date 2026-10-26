import { createContext, useContext } from 'react'
import type { Lang } from './lib/settings'

const ja = {
  tagline: '論文の副図を、同じピクセルサイズにまとめて切り抜き',
  privacy: '画像はアップロードされません（すべてブラウザ内で処理）',
  languageLabel: '表示言語',
  settingsLabel: '設定',
  previewLabel: 'プレビュー',

  sizeTitle: '出力サイズ',
  sizeMin: '最小サイズ',
  sizeMax: '最大サイズ',
  sizeCustom: '手入力',
  width: '幅',
  height: '高さ',
  statusCropOnly: (n: number) => `全 ${n} 枚が切り取りだけで揃います`,
  statusPadded: (k: number) => `${k} 枚は出力サイズより小さいため、足りない部分に余白を追加します`,
  statusEmpty: '画像を追加すると、ここに結果が表示されます',
  sizeTooLarge: 'サイズが大きいため、ブラウザによっては書き出せないことがあります（目安：約 1,600 万ピクセルまで）',

  anchorTitle: '基準点',
  anchorNames: ['左上', '上', '右上', '左', '中央', '右', '左下', '下', '右下'],
  anchorHint: (name: string) => `${name}を残して、はみ出した部分を切り取ります`,
  anchorNote: 'プレビューの枠をドラッグすると、1枚ずつ位置を微調整できます',

  fillTitle: '余白の色',
  fillWhite: '白',
  fillTransparent: '透明',
  fillCustom: '指定色',
  fillColorLabel: '色',
  fillHint: '画像が出力サイズより小さいときだけ使われます',
  fillJpgNote: 'JPG は透明にできないため、透明を選んだ場合は白になります',

  svgTitle: 'SVG の読み込み倍率',
  svgHintOne: (name: string, w: number, h: number) => `${name} を ${w} × ${h} px の画像にしてから切り取ります`,
  svgHintMany: (n: number) => `${n} 個の SVG を、この倍率で画像にしてから切り取ります`,
  svgNote: '他の図と文字の大きさが近くなる倍率を選んでください',
  svgNone: 'SVG を読み込むと、ここで倍率を選べます',

  exportTitle: '書き出し',
  formatLabel: '形式',
  formatOriginal: '元のまま',
  svgToPng: 'SVG は PNG で書き出します',
  jpgQuality: 'JPG 品質',
  jpgNote: 'JPG は保存し直すたびに少し劣化します。気になる場合は PNG を選んでください',
  namingLabel: 'ファイル名',
  namingSuffix: '元の名前＋接尾辞',
  namingSequence: '連番',
  suffixLabel: '接尾辞',
  prefixLabel: '接頭辞',
  filesLabel: '出力ファイル',
  download: (n: number) => `ZIP で一括ダウンロード（${n} 枚）`,
  exporting: (done: number, total: number) => `書き出し中… ${done} / ${total}`,
  exportDone: (n: number, name: string) => `${n} 枚を ${name} にまとめました`,

  dropTitle: 'ここに画像をドロップ',
  dropSub: 'PNG・JPG・SVG／複数まとめて追加できます',
  chooseFiles: 'ファイルを選択',
  clearAll: 'すべて削除',

  viewLabel: '表示',
  viewCrop: '切り取り枠',
  viewResult: '仕上がり',
  dragHint: '白い枠をドラッグ（または枠を選んで矢印キー）すると、画像ごとに位置を調整できます',
  resultHint: '書き出される画像のプレビューです',
  legendCrop: '−：切り取る量 (px)',
  legendPad: '＋：追加する余白 (px)',
  summary: (n: number, w: number, h: number) => `${n} 枚 → ${w} × ${h} px`,
  edges: ['左', '右', '上', '下'],
  chipCropOnly: '切り取りのみ',
  chipPadded: '余白あり',
  resetPosition: '位置を戻す',
  removeImage: (name: string) => `${name} を削除`,
  cropFrameLabel: (name: string) => `${name} の切り取り枠。矢印キーで 1 px、Shift キーと一緒に押すと 10 px 動きます`,

  emptyTitle: 'まだ画像がありません',
  emptySteps: [
    '副図の画像（PNG・JPG・SVG）をまとめてドロップ',
    '出力サイズと基準点を選ぶ',
    'ZIP で一括ダウンロード',
  ],

  unsupported: (names: string) => `対応していない形式のため、読み込みませんでした：${names}`,
  loadFailed: (names: string) => `読み込めませんでした：${names}`,
  exportFailed: (name: string) => `${name} を書き出せませんでした。サイズを小さくするか、別のブラウザで試してください`,
  dismiss: '閉じる',
}

export type Messages = typeof ja

const en: Messages = {
  tagline: 'Crop paper subfigures to the exact same pixel size, all at once',
  privacy: 'Nothing is uploaded: everything runs in your browser',
  languageLabel: 'Language',
  settingsLabel: 'Settings',
  previewLabel: 'Preview',

  sizeTitle: 'Output size',
  sizeMin: 'Smallest',
  sizeMax: 'Largest',
  sizeCustom: 'Custom',
  width: 'Width',
  height: 'Height',
  statusCropOnly: (n) => `All ${n} images line up by cropping only`,
  statusPadded: (k) => `${k} image(s) are smaller than the output and get padding`,
  statusEmpty: 'Add images to see the result here',
  sizeTooLarge: 'This size is large and some browsers may fail to export it (about 16 million pixels is safe)',

  anchorTitle: 'Anchor',
  anchorNames: ['Top left', 'Top', 'Top right', 'Left', 'Center', 'Right', 'Bottom left', 'Bottom', 'Bottom right'],
  anchorHint: (name) => `Keeps the ${name.toLowerCase()} and crops the rest`,
  anchorNote: 'Drag a frame in the preview to fine-tune a single image',

  fillTitle: 'Padding color',
  fillWhite: 'White',
  fillTransparent: 'Transparent',
  fillCustom: 'Custom',
  fillColorLabel: 'Color',
  fillHint: 'Used only where an image is smaller than the output',
  fillJpgNote: 'JPG cannot be transparent, so transparent padding becomes white',

  svgTitle: 'SVG import scale',
  svgHintOne: (name, w, h) => `${name} is rendered at ${w} × ${h} px, then cropped`,
  svgHintMany: (n) => `${n} SVG files are rendered at this scale, then cropped`,
  svgNote: 'Pick the scale that makes its text about as large as in the other figures',
  svgNone: 'Load an SVG to choose its scale here',

  exportTitle: 'Export',
  formatLabel: 'Format',
  formatOriginal: 'Keep',
  svgToPng: 'SVG files are exported as PNG',
  jpgQuality: 'JPG quality',
  jpgNote: 'JPG loses a little quality every time it is re-saved. Choose PNG if that matters',
  namingLabel: 'File names',
  namingSuffix: 'Name + suffix',
  namingSequence: 'Numbered',
  suffixLabel: 'Suffix',
  prefixLabel: 'Prefix',
  filesLabel: 'Output files',
  download: (n) => `Download ${n} as ZIP`,
  exporting: (done, total) => `Exporting… ${done} / ${total}`,
  exportDone: (n, name) => `Packed ${n} images into ${name}`,

  dropTitle: 'Drop images here',
  dropSub: 'PNG, JPG, SVG. Add several at once',
  chooseFiles: 'Choose files',
  clearAll: 'Remove all',

  viewLabel: 'View',
  viewCrop: 'Crop frames',
  viewResult: 'Result',
  dragHint: 'Drag a white frame (or focus it and use the arrow keys) to adjust where each image is cropped',
  resultHint: 'This is what gets exported',
  legendCrop: '−: cropped px',
  legendPad: '+: padded px',
  summary: (n, w, h) => `${n} images → ${w} × ${h} px`,
  edges: ['Left', 'Right', 'Top', 'Bottom'],
  chipCropOnly: 'Crop only',
  chipPadded: 'Padded',
  resetPosition: 'Reset position',
  removeImage: (name) => `Remove ${name}`,
  cropFrameLabel: (name) => `Crop frame of ${name}. Arrow keys move it 1 px, with Shift 10 px`,

  emptyTitle: 'No images yet',
  emptySteps: [
    'Drop your subfigure images (PNG, JPG, SVG) all at once',
    'Choose the output size and anchor',
    'Download everything as a ZIP',
  ],

  unsupported: (names) => `Skipped unsupported files: ${names}`,
  loadFailed: (names) => `Could not read: ${names}`,
  exportFailed: (name) => `Could not export ${name}. Try a smaller size or another browser`,
  dismiss: 'Dismiss',
}

export const MESSAGES: Record<Lang, Messages> = { ja, en }

export const MessagesContext = createContext<Messages>(ja)

export function useMessages(): Messages {
  return useContext(MessagesContext)
}
