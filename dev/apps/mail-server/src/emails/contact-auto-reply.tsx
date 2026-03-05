import { Section, Text, Hr } from "@react-email/components";
import type { Contact } from "@life-time-support/types/contact";
import { EmailLayout } from "./components/email-layout";
import { DataRow } from "./components/data-row";
import { contactFields } from "./contact-fields";

export type ContactAutoReplyProps = Contact;

const ContactAutoReply = (props: ContactAutoReplyProps) => {
  return (
    <EmailLayout
      preview={`${props.name}様、お問い合わせありがとうございます`}
      heading="お問い合わせありがとうございます"
      footer={
        <>
          {/* Notice */}
          <Section className="bg-secondary-100 px-8 py-6">
            <Text className="m-0 text-xs leading-5 text-secondary-500">
              ※ このメールは自動送信されています。本メールに直接ご返信いただくことはできません。
            </Text>
            <Text className="m-0 mt-2 text-xs leading-5 text-secondary-500">
              ※ お心当たりのない場合は、本メールを破棄していただきますようお願いいたします。
            </Text>
          </Section>

          {/* Footer */}
          <Section className="rounded-b-lg bg-secondary-500 px-8 py-6">
            <Text className="m-0 text-sm font-bold text-neutral-100">
              株式会社ライフタイムサポート
            </Text>
            <Text className="m-0 mt-2 text-xs leading-5 text-secondary-300">
              〒343-0806 埼玉県越谷市宮本町5-5-8
            </Text>
            <Text className="m-0 mt-1 text-xs leading-5 text-secondary-300">
              TEL: 048-954-9105 / FAX: 048-954-9106
            </Text>
          </Section>
        </>
      }
    >
      {/* Greeting */}
      <Section className="bg-neutral-100 px-8 pb-2 pt-8">
        <Text className="m-0 text-sm leading-7 text-neutral-700">{props.name} 様</Text>
        <Text className="m-0 mt-4 text-sm leading-7 text-neutral-700">
          この度はお問い合わせいただき、誠にありがとうございます。
          <br />
          以下の内容でお問い合わせを受け付けいたしました。
        </Text>
        <Text className="m-0 mt-2 text-sm leading-7 text-neutral-700">
          内容を確認のうえ、担当者より改めてご連絡させていただきます。
          <br />
          通常、2営業日以内にご返信いたします。
        </Text>
      </Section>

      {/* Divider */}
      <Section className="px-8">
        <Hr
          className="my-0 border-solid border-neutral-100"
          style={{ borderTopColor: "#e5e5e5" }}
        />
      </Section>

      {/* Data fields */}
      <Section className="bg-neutral-100 px-8 pb-8 pt-4">
        <Text className="m-0 mb-4 text-xs font-bold uppercase tracking-widest text-primary-500">
          お問い合わせ内容
        </Text>
        {contactFields.map(({ label, key }, i) => (
          <DataRow key={key} label={label} value={props[key]} index={i} />
        ))}
      </Section>
    </EmailLayout>
  );
};

ContactAutoReply.PreviewProps = {
  name: "山田 太郎",
  nameKana: "やまだ たろう",
  phone: "090-1234-5678",
  email: "taro@example.com",
  subject: "資料請求",
} satisfies ContactAutoReplyProps;

export default ContactAutoReply;
