import { Section, Row, Column, Text, Hr } from "@react-email/components";

export interface DataRowProps {
  label: string;
  value: string;
  index: number;
}

export function DataRow({ label, value, index }: DataRowProps) {
  return (
    <Section>
      {index > 0 && (
        <Hr
          className="my-0 border-solid border-neutral-100"
          style={{ borderTopColor: "#e5e5e5" }}
        />
      )}
      <Row className={index % 2 === 0 ? "bg-primary-100" : "bg-neutral-100"}>
        <Column className="w-[140px] px-4 py-3 align-top">
          <Text className="m-0 text-xs font-bold uppercase tracking-wide text-primary-500">
            {label}
          </Text>
        </Column>
        <Column className="px-4 py-3 align-top">
          <Text className="m-0 text-sm text-neutral-900">{value}</Text>
        </Column>
      </Row>
    </Section>
  );
}
