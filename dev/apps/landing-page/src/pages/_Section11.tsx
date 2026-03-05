import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

interface FAQ {
  label: string | null;
  questions: {
    question: string;
    answer: string;
  }[];
}

function parseText(text: string) {
  const parts = text.split(/\*([^*]+)\*/g);
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

const faqs: FAQ[] = [
  {
    label: null,
    questions: [
      {
        question: "無料で内覧会に同行してくれる？",
        answer:
          "はい。ただ、同行サービスにつきましては、*弊社にて一定の商品をご発注いただいたお客様を対象*とさせていただいております。",
      },
      {
        question: "指定業者じゃなくて問題ない？",
        answer: "*規約に沿って施工するため*問題ありません。",
      },
      {
        question: "他社より安い理由は？",
        answer: "*中間マージンを排除し、適正価格だけを提示*しているためです。",
      },
    ],
  },
  {
    label: "対応エリアについて",
    questions: [
      {
        question: "対応エリアはどこまでですか",
        answer:
          "*東京・埼玉・神奈川・千葉・茨城の各都県は、基本的に全域対応しております。*\n※一部の遠方エリアにつきましては、別途出張料金を頂戴する場合がございます。",
      },
      {
        question: "遠方でも施工できますか？",
        answer:
          "*内容や地域によっては対応可能です。*まずは「物件所在地（市区町村まで）」と「ご検討中の工事内容」を添えてお問い合わせください。遠方となる場合は、出張費の有無・目安もあわせてご案内いたします。",
      },
    ],
  },
  {
    label: "打ち合わせ方法",
    questions: [
      {
        question: "打ち合わせ方法は？",
        answer:
          "お客様のご都合に合わせて、*「オンラインでの打ち合わせ」または「ショールームでの対面打ち合わせ」*のいずれかをお選びいただけます。",
      },
      {
        question: "所要時間はどれくらいですか？",
        answer:
          "ご検討内容やご相談のボリュームにもよりますが、*おおよそ1.5時間〜2時間程度*お時間をいただいております。\nもし、お時間に制限がある場合は、開始時にお申し付けいただければ、時間に合わせて調整することも可能です。",
      },
    ],
  },
  {
    label: "取り扱い商品\n（マンションオプション全般）について",
    questions: [
      {
        question: "対応工事は何ですか？",
        answer: `マンションオプション全般を幅広く取り扱っております。主な内容は以下の通りです。
・ 各種コーティング：フロア／水回り／クロス／白木
・ 内装建材：エコカラット／輸入クロス／オーダーミラー／ピクチャーレール／バルコニータイル
・ オーダー家具・収納：食器棚・TVボード等のオーダー家具／システム収納／キャットウォーク
・ 窓まわり：オーダーカーテン／窓ガラスフィルム
・ キッチン設備：ビルトイン食洗機／ビルトインオーブン（ガスオーブン含む）／IHクッキングヒーター／レンジフードフィルター
・ 家電・設備機器：エアコン（販売・設置）／照明設備／テレビ壁掛け工事（ふかし壁工事含む）
・ その他：涼風暖房機（脱衣所ヒーター）／防水パン／ハンギングバー／エアフープ
「これも対応できる？」という内容も、まずはお気軽にご相談ください。`,
      },
      {
        question: "工事はまとめて依頼できますか？",
        answer:
          "はい、可能です。*複数のオプション工事をまとめてご相談いただくことで、全体の優先順位を整理しながら、費用感やスケジュールも含めて最適な進め方をご提案いたします。*ご希望内容が固まっていない段階でも問題ございませんので、まずは検討中の項目をお知らせください。",
      },
    ],
  },
];

export default function Section11() {
  return (
    <section id="よくある質問" className="space-y-12 bg-orange-100 p-6">
      <header className="text-center">
        <h2 className="text-2xl font-bold">よくある質問</h2>
      </header>
      <div className="space-y-12">
        {faqs.map((faq, index) => (
          <div key={index} className="space-y-6">
            {faq.label && (
              <h3 className="text-center font-bold whitespace-pre-wrap">{faq.label}</h3>
            )}
            <Accordion className="space-y-6" type="multiple">
              {faq.questions.map((question, index) => (
                <AccordionItem
                  key={index}
                  value={question.question}
                  className="bg-neutral-100 p-2"
                  data-slot="accordion-item"
                >
                  <AccordionTrigger
                    className="flex w-full items-center justify-between [&[data-state=open]>svg]:rotate-180"
                    data-slot="accordion-trigger"
                  >
                    <div className="flex items-center">
                      <div className="-mt-1 text-2xl font-bold text-orange-500">Q</div>
                      <div className="ml-2">{question.question}</div>
                    </div>
                    <ChevronDown
                      className="h-4 w-4 transition-transform duration-200"
                      strokeWidth={3}
                    />
                  </AccordionTrigger>
                  <AccordionContent
                    className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down mt-2 flex w-full items-start overflow-hidden"
                    data-slot="accordion-content"
                  >
                    <div className="-mt-1 text-2xl font-bold">A</div>
                    <div className="ml-2 whitespace-pre-wrap">{parseText(question.answer)}</div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </section>
  );
}
