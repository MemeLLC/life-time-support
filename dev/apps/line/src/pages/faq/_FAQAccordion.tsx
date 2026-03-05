import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { faqItems } from "./data";

export default function FAQAccordion() {
  return (
    <Accordion.Root type="single" collapsible className="space-y-4">
      {faqItems.map((item, index) => (
        <Accordion.Item
          key={index}
          value={`item-${index}`}
          className="group border-foreground/5 hover:border-primary/20 data-[state=open]:border-primary/30 rounded-2xl border bg-white shadow-[0_4px_40px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_8px_60px_rgba(255,137,0,0.12)] data-[state=open]:shadow-[0_8px_60px_rgba(255,137,0,0.15)]"
        >
          <Accordion.Header className="flex">
            <Accordion.Trigger className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left transition-colors md:px-8 md:py-6">
              <div className="flex items-start gap-4">
                <span className="bg-primary/10 text-primary group-data-[state=open]:bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors group-data-[state=open]:text-white">
                  Q
                </span>
                <span className="text-foreground text-base leading-relaxed font-bold md:text-lg">
                  {item.question}
                </span>
              </div>
              <ChevronDown
                size={20}
                className="text-foreground/40 group-data-[state=open]:text-primary shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
            <div className="px-6 pb-6 md:px-8 md:pb-8">
              <div className="flex gap-4">
                <span className="bg-secondary/10 text-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
                  A
                </span>
                <p className="text-foreground/70 text-sm leading-relaxed whitespace-pre-wrap md:text-base">
                  {item.answer}
                </p>
              </div>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
