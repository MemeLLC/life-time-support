import { z } from "zod";

export const propertyTypes = [
  "新築マンション",
  "中古マンション",
  "新築戸建て",
  "中古戸建て",
] as const;

export const consideringOptions = [
  "フロアコーティング",
  "エコカラット",
  "窓ガラスフィルム",
  "バルコニータイル",
  "オーダー家具",
  "食洗機",
  "その他",
] as const;

export const meetingTimeSlots = ["午前", "午後", "指定なし"] as const;

/** 間取り図アップロードの許可 MIME タイプ */
export const FLOOR_PLAN_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

/** 間取り図アップロードの許可拡張子 */
export const FLOOR_PLAN_EXTENSIONS = ["png", "jpg", "jpeg", "webp"] as const;

/** 間取り図アップロードの最大ファイルサイズ (bytes) */
export const FLOOR_PLAN_MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const contactDetailsSchema = z.object({
  propertyType: z.enum(propertyTypes).optional(),
  condoName: z.string().trim().max(200).optional(),
  moveInYear: z.string().trim().max(10).optional(),
  moveInMonth: z.string().trim().max(10).optional(),
  previewYear: z.string().trim().max(10).optional(),
  previewMonth: z.string().trim().max(10).optional(),
  keyHandoverDate: z.string().trim().max(20).optional(),
  considering: z.array(z.enum(consideringOptions)).max(consideringOptions.length).optional(),
  meetingDate1: z.string().trim().max(20).optional(),
  meetingTimeSlot1: z.enum(meetingTimeSlots).optional(),
  meetingDate2: z.string().trim().max(20).optional(),
  meetingTimeSlot2: z.enum(meetingTimeSlots).optional(),
  meetingDate3: z.string().trim().max(20).optional(),
  meetingTimeSlot3: z.enum(meetingTimeSlots).optional(),
  referrerName: z.string().trim().max(100).optional(),
  referralCode: z.string().trim().max(50).optional(),
  message: z.string().trim().max(2000).optional(),
});

export type ContactDetails = z.infer<typeof contactDetailsSchema>;
