import { Section, Text, Img } from "@react-email/components";
import type { Contact } from "@life-time-support/types/contact";
import type { ContactDetails } from "@life-time-support/types/contact-details";
import { EmailLayout } from "./components/email-layout";
import { DataRow } from "./components/data-row";

export interface ContactDetailsNotificationProps extends ContactDetails {
  contact: Contact;
  source: string;
  floorPlanSrc?: string;
}

export function formatYearMonth(year?: string, month?: string): string | undefined {
  if (!year && !month) return undefined;
  return [year, month].filter(Boolean).join("年") + (month ? "月" : "年");
}

type FieldDef =
  | { label: string; key: keyof ContactDetails }
  | { label: string; render: (props: ContactDetailsNotificationProps) => string | undefined };

const sectionDefs: { title: string; fields: FieldDef[] }[] = [
  {
    title: "お問い合わせ者情報",
    fields: [
      { label: "お名前", render: (p) => p.contact.name },
      { label: "ふりがな", render: (p) => p.contact.nameKana },
      { label: "電話番号", render: (p) => p.contact.phone },
      { label: "メールアドレス", render: (p) => p.contact.email },
      { label: "ご相談内容", render: (p) => p.contact.subject },
    ],
  },
  {
    title: "物件情報",
    fields: [
      { label: "物件タイプ", key: "propertyType" },
      { label: "マンション名", key: "condoName" },
    ],
  },
  {
    title: "スケジュール",
    fields: [
      {
        label: "入居予定",
        render: (p) => formatYearMonth(p.moveInYear, p.moveInMonth),
      },
      {
        label: "内覧予定",
        render: (p) => formatYearMonth(p.previewYear, p.previewMonth),
      },
      { label: "鍵引き渡し日", key: "keyHandoverDate" },
    ],
  },
  {
    title: "ご検討内容",
    fields: [
      {
        label: "ご検討サービス",
        render: (p) =>
          p.considering && p.considering.length > 0 ? p.considering.join("、") : undefined,
      },
    ],
  },
  {
    title: "打ち合わせ希望日時",
    fields: [
      {
        label: "第1希望",
        render: (p) =>
          p.meetingDate1
            ? `${p.meetingDate1}${p.meetingTimeSlot1 ? ` ${p.meetingTimeSlot1}` : ""}`
            : undefined,
      },
      {
        label: "第2希望",
        render: (p) =>
          p.meetingDate2
            ? `${p.meetingDate2}${p.meetingTimeSlot2 ? ` ${p.meetingTimeSlot2}` : ""}`
            : undefined,
      },
      {
        label: "第3希望",
        render: (p) =>
          p.meetingDate3
            ? `${p.meetingDate3}${p.meetingTimeSlot3 ? ` ${p.meetingTimeSlot3}` : ""}`
            : undefined,
      },
    ],
  },
  {
    title: "ご紹介情報",
    fields: [
      { label: "紹介者名", key: "referrerName" },
      { label: "紹介コード", key: "referralCode" },
    ],
  },
  {
    title: "メッセージ",
    fields: [{ label: "メッセージ", key: "message" }],
  },
];

function getFieldValue(
  field: FieldDef,
  props: ContactDetailsNotificationProps,
): string | undefined {
  if ("render" in field) return field.render(props);
  return props[field.key] as string | undefined;
}

const ContactDetailsNotification = (props: ContactDetailsNotificationProps) => {
  let rowIndex = 0;

  return (
    <EmailLayout
      preview="【お問い合わせ詳細】追加情報が送信されました"
      heading="お問い合わせ詳細"
      footer={
        <Section className="rounded-b-lg bg-secondary-500 px-8 py-6">
          <Text className="m-0 text-xs leading-5 text-secondary-300">
            このメールはライフタイムサポートのお問い合わせフォームから自動送信されています。
          </Text>
        </Section>
      }
    >
      {/* Body */}
      <Section className="bg-neutral-100 px-8 pb-2 pt-8">
        <Text className="m-0 text-sm leading-6 text-neutral-700">
          以下の詳細情報が送信されました。
        </Text>
        <Text className="m-0 mt-1 text-xs text-neutral-700">送信元: {props.source}</Text>
      </Section>

      {/* Data fields */}
      <Section className="bg-neutral-100 px-8 pb-8">
        {sectionDefs.map((section) => {
          const visibleFields = section.fields.filter(
            (field) => getFieldValue(field, props) !== undefined,
          );
          if (visibleFields.length === 0) return null;

          return (
            <Section key={section.title}>
              <Text className="mb-1 mt-6 text-xs font-bold uppercase tracking-wide text-secondary-500">
                {section.title}
              </Text>
              {visibleFields.map((field) => {
                const value = getFieldValue(field, props)!;
                const currentIndex = rowIndex++;
                return (
                  <DataRow
                    key={field.label}
                    label={field.label}
                    value={value}
                    index={currentIndex}
                  />
                );
              })}
            </Section>
          );
        })}
      </Section>

      {/* Floor plan image */}
      {props.floorPlanSrc && (
        <Section className="bg-neutral-100 px-8 pb-8">
          <Text className="mb-1 mt-6 text-xs font-bold uppercase tracking-wide text-secondary-500">
            間取り図
          </Text>
          <Section
            className="rounded-lg border border-solid border-neutral-100 p-4"
            style={{ borderColor: "#e5e5e5" }}
          >
            <Img
              src={props.floorPlanSrc}
              alt="間取り図"
              className="mx-auto block"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </Section>
        </Section>
      )}
    </EmailLayout>
  );
};

ContactDetailsNotification.PreviewProps = {
  contact: {
    name: "山田 太郎",
    nameKana: "やまだ たろう",
    phone: "090-1234-5678",
    email: "taro@example.com",
    subject: "資料請求",
  },
  propertyType: "新築マンション",
  condoName: "パークタワー東京",
  moveInYear: "2026",
  moveInMonth: "4",
  previewYear: "2026",
  previewMonth: "3",
  keyHandoverDate: "2026-03-20",
  considering: ["フロアコーティング", "エコカラット", "窓ガラスフィルム"],
  meetingDate1: "2026-03-01",
  meetingTimeSlot1: "午前",
  meetingDate2: "2026-03-05",
  meetingTimeSlot2: "午後",
  meetingDate3: "2026-03-10",
  meetingTimeSlot3: "指定なし",
  referrerName: "佐藤 花子",
  referralCode: "REF-12345",
  message: "リビングとキッチンのフロアコーティングについて詳しくお聞きしたいです。",
  floorPlanSrc: "/static/floor-plan-sample.png",
  source: "landing-page",
} satisfies ContactDetailsNotificationProps;

export default ContactDetailsNotification;
