import { subjects, contactSchema, type Contact } from "@life-time-support/types/contact";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import { useSessionStorage } from "@life-time-support/components/session-storage";
import { useSubmitContact } from "@life-time-support/components/contact";
import { Turnstile, useTurnstile } from "@life-time-support/components/turnstile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { ArrowUpRight } from "lucide-react";

export const CONTACT_FORM_STORAGE_KEY = "contactFormData";

export default function Form() {
  const { set: saveContact } = useSessionStorage<Contact>(CONTACT_FORM_STORAGE_KEY);

  const {
    token: turnstileToken,
    siteKey,
    onSuccess,
    onExpire,
  } = useTurnstile(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY);

  const { submit, status } = useSubmitContact({
    baseUrl: import.meta.env.PUBLIC_MAIL_SERVER_URL,
    source: "landing-page",
  });
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    getValues,
    formState: { isValid, errors },
  } = useForm<Contact>({
    mode: "onTouched",
    reValidateMode: "onChange",
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      nameKana: "",
      phone: "",
      email: "",
      subject: undefined,
    },
  });

  const isPending = status === "pending";

  // IME入力中のひらがなを一時保存し、確定時にふりがなフィールドに追記
  const composingKanaRef = useRef<string>("");

  const handleNameCompositionUpdate = (e: React.CompositionEvent<HTMLInputElement>) => {
    const data = e.data;
    // ひらがなの場合は一時保存
    if (data && /^[ぁ-んー\s]+$/.test(data)) {
      composingKanaRef.current = data;
    }
  };

  const handleNameCompositionEnd = () => {
    const kana = composingKanaRef.current;
    if (kana) {
      const currentKana = getValues("nameKana") || "";
      setValue("nameKana", currentKana + kana, { shouldValidate: true });
      composingKanaRef.current = "";
    }
  };

  const onSubmit = async (data: Contact) => {
    if (!turnstileToken) return;
    clearErrors("root");

    const ok = await submit(data, turnstileToken);
    if (ok) {
      saveContact(data);
      window.location.href = "/contact/details";
    } else {
      setError("root", {
        message: "送信に失敗しました。しばらくしてから再度お試しください。",
      });
    }
  };

  return (
    <div>
      <h1 className="text-center text-3xl font-bold">お問い合わせ</h1>
      <form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        className="mt-6 space-y-6"
      >
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                お名前
                <span className="text-destructive text-xs">※必須</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="山田 太郎"
                onChange={(e) => {
                  field.onChange(e);
                  if (e.target.value === "") {
                    setValue("nameKana", "", { shouldValidate: false });
                  }
                }}
                onCompositionUpdate={handleNameCompositionUpdate}
                onCompositionEnd={handleNameCompositionEnd}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="nameKana"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                ふりがな
                <span className="text-destructive text-xs">※必須</span>
              </FieldLabel>
              <Input {...field} id={field.name} placeholder="やまだ たろう" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="phone"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                電話番号
                <span className="text-destructive text-xs">※必須</span>
              </FieldLabel>
              <Input {...field} id={field.name} type="tel" placeholder="090-1234-5678" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                メールアドレス
                <span className="text-destructive text-xs">※必須</span>
              </FieldLabel>
              <Input {...field} id={field.name} type="email" placeholder="example@email.com" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="subject"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                ご相談内容
                <span className="text-destructive text-xs">※必須</span>
              </FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="ご相談内容を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject: string) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Turnstile siteKey={siteKey} onSuccess={onSuccess} onExpire={onExpire} />
        <button
          type="submit"
          disabled={(!isValid && !errors.root) || isPending || !turnstileToken}
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
