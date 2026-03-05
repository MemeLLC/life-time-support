import { Section, Text } from "@react-email/components";
import type { Contact } from "@life-time-support/types/contact";
import { EmailLayout } from "./components/email-layout";
import { DataRow } from "./components/data-row";
import { contactFields } from "./contact-fields";

export interface ContactNotificationProps extends Contact {
  source: string;
}

const ContactNotification = (props: ContactNotificationProps) => {
  return (
    <EmailLayout
      preview={`【お問い合わせ】${props.name}様 - ${props.subject}`}
      heading="新規お問い合わせ"
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
          以下の内容でお問い合わせがありました。
        </Text>
        <Text className="m-0 mt-1 text-xs text-neutral-700">送信元: {props.source}</Text>
      </Section>

      {/* Data fields */}
      <Section className="bg-neutral-100 px-8 pb-8">
        {contactFields.map(({ label, key }, i) => (
          <DataRow key={key} label={label} value={props[key]} index={i} />
        ))}
      </Section>
    </EmailLayout>
  );
};

ContactNotification.PreviewProps = {
  name: "山田 太郎",
  nameKana: "やまだ たろう",
  phone: "090-1234-5678",
  email: "taro@example.com",
  subject: "資料請求",
  source: "landing-page",
} satisfies ContactNotificationProps;

export default ContactNotification;
