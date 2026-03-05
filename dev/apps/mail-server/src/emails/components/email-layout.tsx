import type { ReactNode } from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Tailwind,
} from "@react-email/components";
import tailwindConfig from "../tailwind.config";

export interface EmailLayoutProps {
  preview: string;
  heading: string;
  children: ReactNode;
  footer: ReactNode;
}

export function EmailLayout({ preview, heading, children, footer }: EmailLayoutProps) {
  return (
    <Html lang="ja">
      <Tailwind config={tailwindConfig}>
        <Head />
        <Preview>{preview}</Preview>
        <Body className="bg-neutral-100 py-10 font-sans">
          <Container className="mx-auto max-w-[600px]">
            {/* Header */}
            <Section className="rounded-t-lg bg-primary-500 px-8 pb-6 pt-8">
              <Text className="m-0 text-xs font-bold uppercase tracking-widest text-primary-100">
                Life Time Support
              </Text>
              <Heading as="h1" className="m-0 mt-2 text-2xl font-bold text-neutral-100">
                {heading}
              </Heading>
            </Section>

            {/* Accent bar */}
            <Section className="h-1 bg-secondary-500" />

            {children}

            {footer}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
