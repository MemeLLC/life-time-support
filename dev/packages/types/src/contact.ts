import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const subjects = [
  "資料請求",
  "概算見積り",
  "お打ち合わせ",
  "内覧会同行サポート",
  "その他",
] as const;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "必須です")
    .max(100, "100文字以内で入力してください")
    .regex(/^[^\r\n\0]+$/, "制御文字は使用できません"),
  nameKana: z
    .string()
    .trim()
    .min(1, "必須です")
    .max(100, "100文字以内で入力してください")
    .regex(/^[ぁ-んー\s]+$/, "ひらがなで入力してください"),
  phone: z.string().refine((value) => isValidPhoneNumber(value, "JP"), {
    message: "無効な電話番号です",
  }),
  email: z.email("無効なメールアドレスです").max(254, "254文字以内で入力してください"),
  subject: z.enum(subjects, {
    message: "必須です",
  }),
});

export type Contact = z.infer<typeof contactSchema>;
