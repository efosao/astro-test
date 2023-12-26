import { z } from "zod";

import type { EmailTypes } from "~/types/email.type";
import { EmailTemplates } from "~/types/email.type";
import { client as postmarkClient } from "lib/postmark";

const COMPANY_NAME = "Vauntly Inc.";
const FROM_EMAIL_DEFAULT = "info@vauntly.com";
const DEFAULT_URL = "https://vauntly.com";
const HELP_URL = "https://vauntly.com/faq";
const LOGIN_URL = "https://vauntly.com/login";
const PRODUCT_NAME = "Vauntly Job Board";
const SENDER_NAME = "Team Vauntly";
const SUPPORT_EMAIL = "support@vauntly.com";

const defaultData = {
  company_name: COMPANY_NAME,
  default_url: DEFAULT_URL,
  help_url: HELP_URL,
  product_name: PRODUCT_NAME,
  sender_name: SENDER_NAME,
  support_email: SUPPORT_EMAIL,
};

export type WelcomeEmailOptionsType = {
  recipientName: string;
  recipientEmail: string;
  type: EmailTypes.WELCOME_EMAIL;
};

export async function sendWelcomeEmail(data: WelcomeEmailOptionsType) {
  const TEMPLATE_ID = EmailTemplates.WELCOME_EMAIL;
  const emailData = {
    To: data.recipientEmail,
    TemplateModel: {
      action_url: `${DEFAULT_URL}?welcome=1`,
      full_name: data.recipientName,
      login_url: LOGIN_URL,
      ...defaultData,
    },
  };

  const welcomeEmailSchema = z.object({
    TemplateId: z.number().default(TEMPLATE_ID),
    To: z.string().email(),
    From: z.string().email().default(FROM_EMAIL_DEFAULT),
    TemplateModel: z.object({
      action_url: z.string().url(),
      company_name: z.string(),
      help_url: z.string().url(),
      login_url: z.string().url(),
      full_name: z.string(),
      product_name: z.string(),
      sender_name: z.string(),
      support_email: z.string().email(),
    }),
  });

  const parseResult = welcomeEmailSchema.safeParse(emailData);

  if (!parseResult.success) {
    return Promise.reject(parseResult.error);
  }

  try {
    if (!postmarkClient) throw new Error("Postmark client is not defined");
    const result = await postmarkClient.sendEmailWithTemplate(parseResult.data);
    return result;
  } catch (error: any) {
    console.log("sending email:error", { error });
    return Promise.reject(error);
  }
}
