import { Page } from '../components/Page'
import logo from './logo.svg'
import { partyA, partyB, contractDate, articles, company } from './Page01'

// ============================================================
// 業務委託契約書テンプレート — 合同会社Meme（2/2ページ目）
// ============================================================

const additionalArticles = [
  {
    title: '再委託の禁止',
    content:
      '乙は、甲の書面による事前の承諾なく、本業務の全部または一部を第三者に再委託してはならない。',
  },
  {
    title: '契約解除',
    content:
      '甲または乙は、相手方が以下の各号のいずれかに該当した場合、催告なく直ちに本契約を解除することができる。\n① 本契約に違反し、相当の期間を定めて催告したにもかかわらず是正されないとき\n② 支払停止もしくは支払不能となったとき、または手形もしくは小切手が不渡りとなったとき\n③ 破産、民事再生、会社更生または特別清算の申し立てがあったとき\n④ 解散の決議をしたとき（合併による場合を除く）',
  },
  {
    title: '損害賠償',
    content:
      '甲および乙は、本契約に違反して相手方に損害を与えた場合、その損害を賠償する責任を負う。ただし、乙の賠償額は本契約に定める報酬額を上限とする。',
  },
  {
    title: '反社会的勢力の排除',
    content:
      '甲および乙は、自らが反社会的勢力（暴力団、暴力団員、暴力団準構成員、暴力団関係企業、その他これらに準ずる者）に該当しないことを表明し、保証する。甲または乙が本条に違反した場合、相手方は催告なく直ちに本契約を解除することができる。',
  },
  {
    title: '協議解決',
    content:
      '本契約に定めのない事項または本契約の解釈について疑義が生じた場合は、甲乙誠意をもって協議の上、解決するものとする。',
  },
  {
    title: '管轄裁判所',
    content:
      '本契約に関する一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とする。',
  },
]

const startIndex = articles.length

// ---------- レンダリング ----------
export function Page02() {
  return (
    <Page>
      <div className="px-14 py-12 text-gray-800 text-[12px] leading-relaxed flex flex-col h-full">
        {/* 条項（続き） */}
        <div className="space-y-4 text-[11.5px] leading-[1.9] mb-8">
          {additionalArticles.map((article, i) => (
            <div key={i}>
              <div className="font-bold text-gray-900 mb-0.5">
                第{startIndex + i + 1}条（{article.title}）
              </div>
              <div className="whitespace-pre-line pl-1">{article.content}</div>
            </div>
          ))}
        </div>

        {/* 締結文 */}
        <div className="text-[11.5px] leading-[1.9] mb-8">
          <p>
            本契約の成立を証するため、本書を2通作成し、甲乙記名押印の上、各1通を保有する。
          </p>
          <p className="mt-3 text-right">{contractDate}</p>
        </div>

        {/* 署名欄 */}
        <div className="flex justify-between gap-8">
          {/* 甲 */}
          <div className="w-[45%] text-[11px] leading-[2]">
            <div className="font-bold text-[12px] text-gray-900 border-b border-gray-300 pb-1 mb-3">
              甲
            </div>
            <div className="space-y-0.5">
              <div>住所: 〒{partyA.postalCode}</div>
              <div className="pl-[3em]">{partyA.address}</div>
              <div>名称: {partyA.name}</div>
              <div>{partyA.representative}</div>
            </div>
            <div className="mt-6 border-b border-gray-300 pb-1 text-gray-400 text-[10px]">
              印
            </div>
          </div>

          {/* 乙 */}
          <div className="w-[45%] text-[11px] leading-[2]">
            <div className="font-bold text-[12px] text-gray-900 border-b border-gray-300 pb-1 mb-3">
              乙
            </div>
            <div className="space-y-0.5">
              <div>住所: 〒{partyB.postalCode}</div>
              <div className="pl-[3em]">{partyB.address}</div>
              <div>名称: {partyB.name}</div>
              <div>{partyB.representative}</div>
            </div>
            <div className="mt-6 border-b border-gray-300 pb-1 text-gray-400 text-[10px]">
              印
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <img src={logo} alt="" className="h-4 w-4" />
            <span>{company.name}</span>
          </div>
          <div>2 / 2</div>
        </div>
      </div>
    </Page>
  )
}
