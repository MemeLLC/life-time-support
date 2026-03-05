import { Page } from '../components/Page'
import logo from './logo.svg'

// ============================================================
// 業務委託契約書テンプレート — 合同会社Meme（1/2ページ目）
// ============================================================
// 使い方: 上部の変数フィールドと articles 配列を編集してください。
// ============================================================

// ---------- 可変フィールド ----------
export const contractDate = '2026年3月4日'

export const partyA = {
  name: '株式会社サンプル',
  postalCode: '100-0001',
  address: '東京都千代田区千代田1-1-1',
  representative: '代表取締役 山田太郎',
}

export const partyB = {
  name: '合同会社Meme',
  postalCode: '182-0007',
  address: '東京都調布市菊野台2-57-19',
  representative: '代表社員 西 凛太朗',
}

export const articles = [
  {
    title: '目的',
    content:
      '本契約は、甲が乙に対し、以下に定める業務を委託し、乙がこれを受託することに関して、必要な事項を定めることを目的とする。',
  },
  {
    title: '委託業務の内容',
    content:
      '甲は乙に対し、以下の業務（以下「本業務」という）を委託する。\n① Webサイトの企画・設計・制作\n② 上記に付随する一切の業務',
  },
  {
    title: '契約期間',
    content:
      '本契約の有効期間は、2026年3月4日から2026年8月31日までとする。ただし、期間満了の1ヶ月前までに甲乙いずれからも書面による解約の申し出がない場合は、同一条件でさらに1年間更新されるものとし、以後も同様とする。',
  },
  {
    title: '報酬',
    content:
      '甲は乙に対し、本業務の対価として金730,000円（税別）を支払うものとする。なお、消費税および地方消費税は別途加算する。',
  },
  {
    title: '支払条件',
    content:
      '甲は、乙からの請求書を受領した月の翌月末日までに、乙が指定する銀行口座に振り込む方法により支払うものとする。なお、振込手数料は甲の負担とする。',
  },
  {
    title: '秘密保持',
    content:
      '甲および乙は、本契約に関連して相手方から開示された技術上、営業上その他一切の情報（以下「秘密情報」という）を、相手方の書面による事前の承諾なく第三者に開示または漏洩してはならない。ただし、以下の各号に該当する情報はこの限りでない。\n① 開示時点で既に公知であったもの\n② 開示後、自己の責に帰さない事由により公知となったもの\n③ 開示時点で既に自己が保有していたもの\n④ 正当な権限を有する第三者から秘密保持義務を負わずに入手したもの',
  },
  {
    title: '知的財産権',
    content:
      '本業務の遂行により生じた成果物に関する著作権（著作権法第27条および第28条の権利を含む）その他一切の知的財産権は、乙から甲への納品および報酬の完済をもって、甲に帰属するものとする。',
  },
]

// ---------- 定型情報 ----------
export const company = {
  name: '合同会社Meme',
  postalCode: '〒182-0007',
  address: '東京都調布市菊野台2-57-19',
  email: 'info@llcmeme.com',
}

// ---------- レンダリング ----------
export function Page01() {
  return (
    <Page>
      <div className="px-14 py-12 text-gray-800 text-[12px] leading-relaxed flex flex-col h-full">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h1 className="text-[24px] font-bold tracking-[0.3em] text-gray-900">
            業務委託契約書
          </h1>
        </div>

        {/* 前文 */}
        <div className="mb-5 text-[11.5px] leading-[1.9]">
          <p>
            {partyA.name}（以下「甲」という）と{partyB.name}
            （以下「乙」という）は、甲が乙に業務を委託するにあたり、以下のとおり契約（以下「本契約」という）を締結する。
          </p>
        </div>

        {/* 条項 */}
        <div className="space-y-4 text-[11.5px] leading-[1.9]">
          {articles.map((article, i) => (
            <div key={i}>
              <div className="font-bold text-gray-900 mb-0.5">
                第{i + 1}条（{article.title}）
              </div>
              <div className="whitespace-pre-line pl-1">{article.content}</div>
            </div>
          ))}
        </div>

        {/* フッター */}
        <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <img src={logo} alt="" className="h-4 w-4" />
            <span>{company.name}</span>
          </div>
          <div>1 / 2</div>
        </div>
      </div>
    </Page>
  )
}
