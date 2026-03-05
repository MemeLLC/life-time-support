import { Page } from '../components/Page'
import logo from './logo.svg'

// ============================================================
// 見積書テンプレート — 合同会社Meme
// ============================================================
// 使い方: items 配列と上部の変数フィールドを編集してください。
// ============================================================

// ---------- 可変フィールド ----------
const quoteNumber = 'QT-2026-0001'
const quoteDate = '2026年3月4日'
const validUntil = '2026年4月3日'

const clientName = '株式会社サンプル'
const clientPostalCode = '100-0001'
const clientAddress = '東京都千代田区千代田1-1-1'

const subject = 'Webサイト制作一式'
const notes =
  '本見積書の有効期限は発行日より30日間です。\n内容についてご不明な点がございましたら、お気軽にお問い合わせください。'

type Item = {
  description: string
  quantity: number
  unit: string
  unitPrice: number
}

const items: Item[] = [
  { description: 'Webサイト制作', quantity: 1, unit: '式', unitPrice: 500000 },
  { description: 'ロゴデザイン', quantity: 1, unit: '式', unitPrice: 150000 },
  { description: 'コンテンツ撮影', quantity: 1, unit: '回', unitPrice: 80000 },
]

const taxRate = 0.1

// ---------- 自動計算 ----------
const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
const tax = Math.floor(subtotal * taxRate)
const total = subtotal + tax

const fmt = (n: number) =>
  n.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' })

// ---------- 定型情報 ----------
const company = {
  name: '合同会社Meme',
  postalCode: '〒182-0007',
  address: '東京都調布市菊野台2-57-19',
  tel: '080-9288-2539',
  email: 'info@llcmeme.com',
  invoiceRegistration: 'T5012403005297',
}

// ---------- レンダリング ----------
export function Page01() {
  return (
    <Page>
      <div className="px-14 py-12 text-gray-800 text-[13px] leading-relaxed flex flex-col h-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold tracking-[0.3em] text-gray-900">
            御 見 積 書
          </h1>
        </div>

        {/* 上段: 見積先 / 見積元 */}
        <div className="flex justify-between mb-8">
          {/* 見積先 */}
          <div className="w-[48%]">
            <div className="text-[18px] font-bold border-b-2 border-gray-900 pb-1 mb-3">
              {clientName}
              <span className="text-[14px] font-normal ml-2">御中</span>
            </div>
            <div className="text-[12px] text-gray-600">
              〒{clientPostalCode}
              <br />
              {clientAddress}
            </div>
            {subject && (
              <div className="mt-3 text-[12px]">
                <span className="text-gray-500">件名: </span>
                <span className="font-medium">{subject}</span>
              </div>
            )}
          </div>

          {/* 見積元 */}
          <div className="w-[42%] text-right text-[11px] text-gray-600 leading-[1.8]">
            <div className="flex items-center justify-end gap-2 mb-1">
              <img src={logo} alt="" className="h-6 w-6" />
              <span className="font-bold text-[14px] text-gray-900">
                {company.name}
              </span>
            </div>
            <div>
              {company.postalCode}
              <br />
              {company.address}
              <br />
              TEL: {company.tel}
              <br />
              Email: {company.email}
            </div>
            <div className="mt-1 text-[10px]">
              登録番号: {company.invoiceRegistration}
            </div>
          </div>
        </div>

        {/* メタ情報行 */}
        <div className="flex justify-between items-end mb-6">
          <div className="space-y-1 text-[12px]">
            <div>
              <span className="text-gray-500 w-24 inline-block">見積番号:</span>
              <span className="font-medium">{quoteNumber}</span>
            </div>
            <div>
              <span className="text-gray-500 w-24 inline-block">見積日:</span>
              <span className="font-medium">{quoteDate}</span>
            </div>
            <div>
              <span className="text-gray-500 w-24 inline-block">有効期限:</span>
              <span className="font-medium">{validUntil}</span>
            </div>
          </div>

          {/* 合計金額ボックス */}
          <div className="border-2 border-gray-900 px-6 py-3 text-right">
            <div className="text-[11px] text-gray-500 mb-0.5">
              御見積金額（税込）
            </div>
            <div className="text-[24px] font-bold text-gray-900 tracking-wide">
              {fmt(total)}
            </div>
          </div>
        </div>

        {/* 明細テーブル */}
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="bg-gray-800 text-white text-[11px]">
              <th className="py-2 px-3 text-left font-medium w-[5%]">No.</th>
              <th className="py-2 px-3 text-left font-medium">摘要</th>
              <th className="py-2 px-3 text-right font-medium w-[10%]">数量</th>
              <th className="py-2 px-3 text-center font-medium w-[8%]">単位</th>
              <th className="py-2 px-3 text-right font-medium w-[18%]">単価</th>
              <th className="py-2 px-3 text-right font-medium w-[18%]">金額</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={i}
                className={`border-b border-gray-200 ${i % 2 === 1 ? 'bg-gray-50' : ''}`}
              >
                <td className="py-2 px-3 text-gray-500">{i + 1}</td>
                <td className="py-2 px-3">{item.description}</td>
                <td className="py-2 px-3 text-right">{item.quantity}</td>
                <td className="py-2 px-3 text-center">{item.unit}</td>
                <td className="py-2 px-3 text-right">{fmt(item.unitPrice)}</td>
                <td className="py-2 px-3 text-right">
                  {fmt(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
            {/* 空行で最低行数を確保 */}
            {Array.from({ length: Math.max(0, 5 - items.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-gray-200">
                <td className="py-2 px-3">&nbsp;</td>
                <td className="py-2 px-3"></td>
                <td className="py-2 px-3"></td>
                <td className="py-2 px-3"></td>
                <td className="py-2 px-3"></td>
                <td className="py-2 px-3"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 小計・税・合計 */}
        <div className="flex justify-end mb-6">
          <div className="w-[280px]">
            <div className="flex justify-between py-1.5 border-b border-gray-200 text-[12px]">
              <span className="text-gray-500">小計</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-200 text-[12px]">
              <span className="text-gray-500">
                消費税（{(taxRate * 100).toFixed(0)}%）
              </span>
              <span>{fmt(tax)}</span>
            </div>
            <div className="flex justify-between py-2 text-[15px] font-bold">
              <span>合計</span>
              <span>{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* 備考 */}
        <div className="text-[11px] text-gray-500 mb-2">
          <div className="font-bold text-gray-700 mb-1">備考</div>
          <div className="whitespace-pre-line">{notes}</div>
        </div>

        {/* フッター */}
        <div className="mt-auto pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400">
          {company.name} | {company.postalCode} {company.address} |{' '}
          {company.email}
        </div>
      </div>
    </Page>
  )
}
