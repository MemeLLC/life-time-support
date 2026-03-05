import type { Contact } from "@life-time-support/types/contact";

export const contactFields: { label: string; key: keyof Contact }[] = [
  { label: "お名前", key: "name" },
  { label: "ふりがな", key: "nameKana" },
  { label: "電話番号", key: "phone" },
  { label: "メールアドレス", key: "email" },
  { label: "ご相談内容", key: "subject" },
];
