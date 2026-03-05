import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import areaImage from "@assets/area.png";

interface Item {
  label: string;
  value: string;
}

const items: Item[] = [
  { label: "会社名", value: "株式会社ライフタイムサポート" },
  { label: "代表取締役", value: "龍竹　一生" },
  {
    label: "所在地",
    value: "本社：〒343-0806　埼玉県越谷市宮本町5-5-8\n倉庫：〒343-0827　埼玉県越谷市川柳町1-156-7",
  },
  { label: "電話番号", value: "048-954-9105" },
  { label: "FAX", value: "048-954-9106" },
  { label: "メールアドレス", value: "info@life-time-support.com" },
  { label: "資本金", value: "5,000,000円" },
  { label: "従業員数", value: "グループ全体　35名" },
  { label: "創業", value: "平成18年9月" },
  {
    label: "主要取引銀行",
    value: "・三菱東京UFJ銀行　越谷支店\n・埼玉信用金庫　大袋支店\n・栃木銀行　蒲生支店",
  },
  {
    label: "事業内容",
    value:
      "・内装工事業及び外装工事業\n・建築工事業及び設備工事業\n・住宅設備機器の販売及び施工\n・電気工事業\n・介護関連サービス\n・前各号に付帯する一切の業務",
  },
  { label: "関連子会社", value: "日本空調サービス\nライフアート株式会社" },
  {
    label: "主要取引先",
    value:
      "・ポラス株式会社\n・株式会社プレステージ\n・インターナショナル\n・フォーミースタジオ\n・リック株式会社\n・株式会社3M\n・株式会社LIXIL\n・株式会社プログレス\n・株式会社ジアス\n・有限会社創営社\n・株式会社丸安商店\n・株式会社ミヤキ\n・株式会社Warranty technology\n・BX文化工芸株式会社\n・株式会社ティースタイル\n・株式会社藤栄",
  },
];

interface Policy {
  title: string;
  content: string;
}

const policies: Policy[] = [
  {
    title: "はじめに",
    content:
      "株式会社ライフタイムサポート（以下、「当社」といいます）は、お客様のプライバシーを尊重し、その保護を徹底するために努めております。本プライバシーポリシーは、当社がどのようにしてお客様の個人情報を収集し、使用し、共有し、保護するかについて説明します。",
  },
  {
    title: "第一条（収集する情報）",
    content:
      "個人情報の収集について当社は、提携先（株式会社ライフタイムサポート）のお問い合わせより、お客様の個人情報をマーケティング活動向上のために収集します。収集する情報は以下の通りです。\n\n・連絡先情報（メールアドレス、電話番号、LINE）",
  },
  {
    title: "第二条（情報の利用目的）",
    content:
      "個人情報の利用目的 収集した個人情報は、以下の目的で利用します。\n\n・マーケティングおよび広告の配信\n・サービスの利用状況の分析\n・法律上の義務の履行",
  },
  {
    title: "第三条（情報の共有）",
    content:
      "当社は、以下の場合を除き、お客様の個人情報を第三者に提供することはありません。\n・法令に基づく場合\n・お客様の同意がある場合",
  },
  {
    title: "第四条（LINE公式の使用について）",
    content:
      "当社は、提携先のお問い合わせのためにLINE公式を使用しています。LINE公式の利用に際しては、LINE公式プライバシーポリシーが適用されます。詳細については、<a href='https://terms2.line.me/line_live_privacy?lang=ja' target='_blank' rel='noopener noreferrer'>LINE公式プライバシーポリシー</a>をご参照ください。",
  },
  {
    title: "第五条（Googleアナリティクスの使用について）",
    content:
      "当社のウェブサイトでは、Googleアナリティクスを使用して訪問者の行動を分析しています。これにより、ウェブサイトの改善を図ることが目的です。Googleアナリティクスに関する詳細およびオプトアウト方法については、<a href='https://marketingplatform.google.com/about/analytics/terms/jp/' target='_blank' rel='noopener noreferrer'>Googleアナリティクスの利用規約</a>および<a href='https://support.google.com/analytics/topic/2919631?hl=en&ref_topic=1008008&sjid=13017550605845474337-AP' target='_blank' rel='noopener noreferrer'>Googleのデータプライバシーポリシーとセキュリティ</a>をご参照ください。",
  },
  {
    title: "第六条（Cookiesの使用について）",
    content:
      "当社のウェブサイトでは、クッキーを使用してお客様のサイト利用状況を把握し、サービス向上を図ります。クッキーの使用を希望しない場合は、ブラウザの設定を変更することでクッキーを無効にすることができます。",
  },
  {
    title: "第七条（個人情報の管理について）",
    content:
      "当社は、個人情報の適切な管理を行い、不正アクセス、紛失、破壊、改ざん、漏洩などの防止に努めます。",
  },
  {
    title: "第八条（お問い合わせ先）",
    content:
      "プライバシーポリシーに関するお問い合わせは、以下の連絡先までお願いします。\n・会社名：広告代理店（合同会社Meme）\n・連絡先メールアドレス：info@llcmeme.com\n・電話番号：080-9288-2539",
  },
  {
    title: "第九条（改定について）",
    content:
      "本プライバシーポリシーは、法令の改正や当社の方針変更に伴い、予告なく変更することがあります。変更後のプライバシーポリシーは、当社ウェブサイトに掲載した時点で効力を生じます。",
  },
];

export default function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center gap-4 bg-neutral-100 pt-4 pb-28">
      <div className="flex gap-4">
        <Dialog>
          <DialogTrigger className="text-xs">会社概要</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold">会社紹介</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[500px]">
              <dl className="space-y-6">
                {items.map((item) => (
                  <div key={item.value}>
                    <dt className="bg-[#E8E8E8] px-6 py-2 font-bold">{item.label}</dt>
                    <dd className="px-6 py-2 whitespace-pre-wrap">{item.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 space-y-4">
                <h3 className="text-center text-2xl font-bold">アクセスマップ</h3>
                <div className="aspect-video w-full">
                  <iframe
                    src="https://www.google.com/maps?q=埼玉県越谷市宮本町5丁目5-8&output=embed"
                    className="h-full w-full border-0"
                    loading="lazy"
                    allowFullScreen={false}
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <h3 className="text-center text-2xl font-bold">対応可能エリア</h3>
                <p>
                  関東全域及び名古屋のタワーマンション、分譲マンション、戸建てまで。食器棚一つからトータルコーディネートまで、幅広く対応しております。
                </p>
                <img
                  src={areaImage.src}
                  alt="対応可能エリア"
                  className="mx-auto h-auto w-[200px]"
                />
                <p>東京都、神奈川県、埼玉県、千葉県、群馬県、茨城県、栃木県、名古屋（愛知県）</p>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger className="text-xs">プライバシーポリシー</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold">
                プライバシーポリシー
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[500px] w-full">
              <ul className="space-y-6">
                {policies.map((policy) => (
                  <li key={policy.title}>
                    <h3 className="text-lg font-bold">{policy.title}</h3>
                    <p
                      className="mt-2 text-sm break-all whitespace-pre-wrap [&_a]:text-blue-600 [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: policy.content }}
                    />
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-xs">&copy; 2026 Life Time Support. All rights reserved.</p>
    </footer>
  );
}
