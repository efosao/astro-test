import type Stripe from "stripe";

import { prisma } from "db";
import type { LineItemType } from "lib/stripe";

export type CreateCheckoutSessionRecParams = {
  lineItems: LineItemType[] | undefined;
  order_total: number;
  pinned_duration_in_days: number;
  post_duration_in_days: number;
  postId: string;
  session_data: any;
  session_status: string;
  userId?: string;
};

export function createCheckoutSessionRec(data: CreateCheckoutSessionRecParams) {
  return prisma.postCheckoutSession.create({
    data: {
      line_items: data.lineItems,
      pinned_duration_in_days: data.pinned_duration_in_days,
      post_duration_in_days: data.post_duration_in_days,
      post_id: data.postId,
      order_total: data.order_total,
      session_data: data.session_data,
      session_status: data.session_status,
      status: "NEW",
      user_id: data.userId,
    },
  });
}

export function getCheckoutSessionsByPostId(postId: string) {
  return prisma.postCheckoutSession.findMany({
    where: {
      post_id: postId,
    },
    orderBy: {
      created_at: "desc",
    },
  });
}

export type UpdateCheckoutSessionParams = {
  session_data: Stripe.Checkout.Session;
  id: string;
};

export function updateSessionStatus(data: UpdateCheckoutSessionParams) {
  return prisma.postCheckoutSession.update({
    where: {
      id: data.id,
    },
    data: {
      session_status: data.session_data.payment_status,
      session_data: data.session_data as unknown as any,
    },
  });
}
