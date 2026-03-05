import { useState } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@radix-ui/react-collapsible";
import { UserRound, MapPinned, Building2, JapaneseYen, Wrench, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const profileFields = [
  { key: "family", icon: UserRound, label: "家族構成" },
  { key: "area", icon: MapPinned, label: "エリア" },
  { key: "property", icon: Building2, label: "物件" },
  { key: "budget", icon: JapaneseYen, label: "工事予算" },
  { key: "request", icon: Wrench, label: "依頼内容" },
] as const;

type ProfileData = Record<(typeof profileFields)[number]["key"], string>;

interface TestimonialItem {
  title: string;
  value: string;
}

export interface Section9CollapsibleProps {
  profile: ProfileData;
  testimonials: TestimonialItem[];
}

export function Section9Collapsible({ profile, testimonials }: Section9CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      className="w-full space-y-4 bg-neutral-100 p-4"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down space-y-4 overflow-hidden text-xs">
        <dl className="space-y-1 rounded-4xl border border-orange-500 bg-orange-100 p-4 font-bold">
          {profileFields.map((field) => (
            <div key={field.key} className="flex items-center justify-between">
              <dt className="flex items-center gap-2">
                <field.icon className="size-6 rounded-full bg-orange-500 p-1 text-neutral-100" />
                {field.label}
              </dt>
              <dd>{profile[field.key]}</dd>
            </div>
          ))}
        </dl>
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <div key={testimonial.title}>
              <h3 className="border-l-4 border-orange-500 pl-4 text-base font-bold text-orange-500">
                {testimonial.title}
              </h3>
              <blockquote className="mt-2 whitespace-pre-wrap">
                <p>{testimonial.value}</p>
              </blockquote>
            </div>
          ))}
        </div>
      </CollapsibleContent>
      <CollapsibleTrigger className="mx-auto flex items-center rounded-full border border-orange-500 px-6 py-2 text-orange-500">
        {isOpen ? "閉じる" : "詳しく見る"}
        <ChevronDown
          className={cn("size-6 transition-transform duration-200", isOpen && "rotate-180")}
        />
      </CollapsibleTrigger>
    </Collapsible>
  );
}
