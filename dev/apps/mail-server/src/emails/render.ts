import { render } from "@react-email/render";
import { createElement } from "react";
import ContactAutoReply from "./contact-auto-reply";
import type { ContactAutoReplyProps } from "./contact-auto-reply";
import ContactDetailsNotification from "./contact-details-notification";
import type { ContactDetailsNotificationProps } from "./contact-details-notification";
import ContactNotification from "./contact-notification";
import type { ContactNotificationProps } from "./contact-notification";

export async function renderContactNotification(props: ContactNotificationProps): Promise<string> {
  return render(createElement(ContactNotification, props));
}

export async function renderContactAutoReply(props: ContactAutoReplyProps): Promise<string> {
  return render(createElement(ContactAutoReply, props));
}

export async function renderContactDetailsNotification(
  props: ContactDetailsNotificationProps,
): Promise<string> {
  return render(createElement(ContactDetailsNotification, props));
}
