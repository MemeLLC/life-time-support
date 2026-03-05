import { Page } from '../components/Page'
import logo from './logo.svg'

// ============================================================
// 請求書テンプレート — 合同会社Meme
// ============================================================
// 使い方: items 配列と上部の変数フィールドを編集してください。
// ============================================================

// ---------- 可変フィールド ----------
const invoiceNumber = 'INV-2026-0001'
const invoiceDate = '2026年3月4日'
const dueDate = '2026年3月31日'

const clientName = '株式会社サンプル'
const clientPostalCode = '100-0001'
const clientAddress = '東京都千代田区千代田1-1-1'

const notes = 'お振込手数料はお客様のご負担でお願いいたします。'

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

const taxRate = 0.10

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

const bank = {
  name: '多摩信用金庫',
  branch: '009（調布）',
  account: '2433626',
  holder: 'ド）ミーム',
}

// ---------- レンダリング ----------
export function Page01() {
  return (
    <Page>
      <div className="px-14 py-12 text-gray-800 text-[13px] leading-relaxed flex flex-col h-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold tracking-[0.3em] text-gray-900">
            請 求 書
          </h1>
        </div>

        {/* 上段: 請求先 / 請求元 */}
        <div className="flex justify-between mb-8">
          {/* 請求先 */}
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
          </div>

          {/* 請求元 */}
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
              <span className="text-gray-500 w-24 inline-block">請求書番号:</span>
              <span className="font-medium">{invoiceNumber}</span>
            </div>
            <div>
              <span className="text-gray-500 w-24 inline-block">請求日:</span>
              <span className="font-medium">{invoiceDate}</span>
            </div>
            <div>
              <span className="text-gray-500 w-24 inline-block">お支払期限:</span>
              <span className="font-medium">{dueDate}</span>
            </div>
          </div>

          {/* 合計金額ボックス */}
          <div className="border-2 border-gray-900 px-6 py-3 text-right">
            <div className="text-[11px] text-gray-500 mb-0.5">ご請求金額（税込）</div>
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

        {/* 振込先 */}
        <div className="bg-gray-50 border border-gray-200 rounded px-5 py-3 mb-4 text-[11px]">
          <div className="font-bold text-[12px] text-gray-700 mb-1.5">
            お振込先
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-gray-600">
            <span>銀行名</span>
            <span className="text-gray-900">{bank.name}</span>
            <span>支店</span>
            <span className="text-gray-900">{bank.branch}</span>
            <span>口座番号</span>
            <span className="text-gray-900">普通 {bank.account}</span>
            <span>口座名義</span>
            <span className="text-gray-900">{bank.holder}</span>
          </div>
        </div>

        {/* 備考 */}
        <div className="text-[11px] text-gray-500 mb-2">
          <div className="font-bold text-gray-700 mb-1">備考</div>
          <div>{notes}</div>
        </div>

        {/* フッター */}
        <div className="mt-auto pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400">
          {company.name} | {company.postalCode} {company.address} | {company.email}
        </div>
      </div>
    </Page>
  )
}
