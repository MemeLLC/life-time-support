import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSessionStorage } from "@life-time-support/components/session-storage";
import { useSubmitContactDetails } from "@life-time-support/components/contact-details";
import { Turnstile, useTurnstile } from "@life-time-support/components/turnstile";
import { CONTACT_FORM_STORAGE_KEY } from "../_Form";
import type { Contact } from "@life-time-support/types/contact";
import {
  propertyTypes,
  consideringOptions,
  meetingTimeSlots,
  contactDetailsSchema,
  type ContactDetails,
} from "@life-time-support/types/contact-details";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowUpRight, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 4 }, (_, i) => String(currentYear + i));
const monthOptions = Array.from({ length: 12 }, (_, i) => String(i + 1));

export default function DetailsForm() {
  const { get: getContactForm } = useSessionStorage<Contact>(CONTACT_FORM_STORAGE_KEY);
  const [contactData, setContactData] = useState<Contact | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [floorPlanFile, setFloorPlanFile] = useState<File | null>(null);
  const { token: turnstileToken, ...turnstileProps } = useTurnstile(
    import.meta.env.PUBLIC_TURNSTILE_SITE_KEY,
  );
  const { submit, status } = useSubmitContactDetails({
    baseUrl: import.meta.env.PUBLIC_MAIL_SERVER_URL,
    source: "landing-page",
  });

  const isPending = status === "pending";

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<ContactDetails>({
    resolver: zodResolver(contactDetailsSchema),
  });

  const formValues = watch();
  const hasAnyValue =
    Object.values(formValues).some((v) => {
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "string") return v.trim() !== "";
      return v != null;
    }) || floorPlanFile != null;

  useEffect(() => {
    setContactData(getContactForm());
    setIsLoaded(true);
  }, [getContactForm]);

  if (!isLoaded) return null;

  if (!contactData) {
    return (
      <div className="space-y-6 text-center">
        <h2 className="text-2xl font-bold">お問い合わせ情報が見つかりません</h2>
        <p>先にお問い合わせフォームをご送信ください。</p>
        <a
          href="/contact"
          className="button button-outline z-10 mx-auto w-fit"
          data-variant="outline"
        >
          <p>お問い合わせフォームへ</p>
          <ArrowUpRight
            size={24}
            className="size-6 rounded-full bg-orange-500 p-1 text-neutral-100"
            strokeWidth={3}
          />
        </a>
      </div>
    );
  }

  const onSubmit = async (data: ContactDetails) => {
    if (!turnstileToken || !contactData) return;
    clearErrors("root");

    const ok = await submit(
      { contact: contactData, details: data, floorPlan: floorPlanFile ?? undefined },
      turnstileToken,
    );
    if (ok) {
      window.location.href = "/thanks";
    } else {
      setError("root", {
        message: "送信に失敗しました。しばらくしてから再度お試しください。",
      });
    }
  };

  return (
    <div>
      <h1 className="text-center text-3xl font-bold">お問い合わせありがとうございます</h1>
      <p className="text-muted-foreground mt-4 text-center">
        {contactData.name}様、お問い合わせありがとうございます。
        <br />
        2営業日以内に担当者よりご連絡いたします。
        <br />
        以下の情報を入力いただけると、スムーズに
        {contactData.subject !== "その他" ? contactData.subject : "ご相談"}
        が行えます。
      </p>
      <form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        className="mt-6 space-y-6"
      >
        {contactData.subject === "資料請求" && (
          <Controller
            name="considering"
            control={control}
            render={({ field }) => {
              const selected = field.value ?? [];
              const toggle = (option: string) => {
                const next = selected.includes(option as (typeof selected)[number])
                  ? selected.filter((v) => v !== option)
                  : [...selected, option as (typeof selected)[number]];
                field.onChange(next);
              };
              return (
                <Field>
                  <FieldLabel>検討中の内容（複数選択可）</FieldLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {consideringOptions.map((option) => (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm has-checked:border-orange-500 has-checked:bg-orange-100"
                      >
                        <input
                          type="checkbox"
                          className="accent-orange-500"
                          checked={selected.includes(option)}
                          onChange={() => toggle(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </Field>
              );
            }}
          />
        )}
        {contactData.subject === "お打ち合わせ" && (
          <div className="space-y-4">
            {(
              [
                ["meetingDate1", "meetingTimeSlot1", "第1希望"],
                ["meetingDate2", "meetingTimeSlot2", "第2希望"],
                ["meetingDate3", "meetingTimeSlot3", "第3希望"],
              ] as const
            ).map(([dateKey, slotKey, label]) => (
              <div key={dateKey}>
                <FieldLabel>{`お打ち合わせ希望日時（${label}）`}</FieldLabel>
                <div className="mt-1.5 flex gap-3">
                  <Controller
                    name={dateKey}
                    control={control}
                    render={({ field }) => {
                      const dateValue = field.value ? new Date(field.value) : undefined;
                      return (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "flex-1 justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="size-4" />
                              {dateValue
                                ? format(dateValue, "yyyy年M月d日", {
                                    locale: ja,
                                  })
                                : "日付を選択"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              locale={ja}
                              mode="single"
                              selected={dateValue}
                              onSelect={(date) =>
                                field.onChange(date ? date.toISOString() : undefined)
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      );
                    }}
                  />
                  <Controller
                    name={slotKey}
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <SelectTrigger className="w-28">
                          <SelectValue placeholder="時間帯" />
                        </SelectTrigger>
                        <SelectContent>
                          {meetingTimeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <Controller
          name="propertyType"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>施工先物件</FieldLabel>
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder="物件タイプを選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Controller
          name="condoName"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>施工先マンション名</FieldLabel>
              <Input
                {...field}
                id={field.name}
                value={field.value ?? ""}
                placeholder="○○マンション"
              />
            </Field>
          )}
        />
        <div className="flex gap-3">
          <Controller
            name="moveInYear"
            control={control}
            render={({ field }) => (
              <Field className="flex-1">
                <FieldLabel htmlFor={field.name}>入居予定時期（年）</FieldLabel>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder="年" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}年
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Controller
            name="moveInMonth"
            control={control}
            render={({ field }) => (
              <Field className="flex-1">
                <FieldLabel htmlFor={field.name}>入居予定時期（月）</FieldLabel>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder="月" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}月
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>
        <div className="flex gap-3">
          <Controller
            name="previewYear"
            control={control}
            render={({ field }) => (
              <Field className="flex-1">
                <FieldLabel htmlFor={field.name}>内覧会時期（年）</FieldLabel>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder="年" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}年
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Controller
            name="previewMonth"
            control={control}
            render={({ field }) => (
              <Field className="flex-1">
                <FieldLabel htmlFor={field.name}>内覧会時期（月）</FieldLabel>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder="月" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}月
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>
        <Controller
          name="keyHandoverDate"
          control={control}
          render={({ field }) => {
            const dateValue = field.value ? new Date(field.value) : undefined;
            return (
              <Field>
                <FieldLabel>鍵引き渡し日</FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      data-empty={!field.value}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="size-4" />
                      {dateValue
                        ? format(dateValue, "yyyy年M月d日", { locale: ja })
                        : "日付を選択してください"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      locale={ja}
                      mode="single"
                      selected={dateValue}
                      onSelect={(date) => field.onChange(date ? date.toISOString() : undefined)}
                    />
                  </PopoverContent>
                </Popover>
              </Field>
            );
          }}
        />
        <Field>
          <FieldLabel htmlFor="floorPlan">間取り図</FieldLabel>
          <Input
            id="floorPlan"
            type="file"
            accept="image/*"
            onChange={(e) => setFloorPlanFile(e.target.files?.[0] ?? null)}
          />
        </Field>
        <Controller
          name="referrerName"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>ご紹介者名</FieldLabel>
              <Input
                {...field}
                id={field.name}
                value={field.value ?? ""}
                placeholder="紹介者のお名前"
              />
            </Field>
          )}
        />
        <Controller
          name="referralCode"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>紹介コード</FieldLabel>
              <Input
                {...field}
                id={field.name}
                value={field.value ?? ""}
                placeholder="紹介コード"
              />
            </Field>
          )}
        />
        <Controller
          name="message"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>お問い合わせ内容、ご要望など</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                value={field.value ?? ""}
                placeholder="ご自由にご記入ください"
              />
            </Field>
          )}
        />
        <Turnstile {...turnstileProps} />
        <button
          type="submit"
          disabled={isPending || !turnstileToken || !hasAnyValue}
          className="button mx-auto flex w-full justify-center"
          data-variant="default"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              送信中...
              <Spinner />
            </span>
          ) : (
            <span className="flex items-center gap-2">
              送信する
              <ArrowUpRight
                className="size-6 rounded-full bg-neutral-100/80 p-1 text-orange-500"
                strokeWidth={3}
              />
            </span>
          )}
        </button>
        {errors.root && (
          <p className="text-destructive text-center text-sm">{errors.root.message}</p>
        )}
      </form>
    </div>
  );
}
