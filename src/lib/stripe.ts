import type { PostCheckoutSession } from "@prisma/client";
import Stripe from "stripe";
import {
  getCheckoutSessionsByPostId,
  updateSessionStatus,
} from "models/post-checkout";
import { publishPost } from "models/post";

// todo: consolidate api init
const STRIPE_SECRET_API_KEY = process.env.STRIPE_SECRET_API_KEY;
if (!STRIPE_SECRET_API_KEY) throw new Error("STRIPE_SECRET_API_KEY is not set");
const stripe = new Stripe(STRIPE_SECRET_API_KEY, {
  apiVersion: "2022-08-01",
});

export type LineItemType = {
  name: string;
  description: string;
  unit_amount: number;
  quantity: number;
};

export type CreateCheckoutSessionParams = {
  url: string;
  email?: string;
  lineItems: LineItemType[];
  postId: string;
};

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
) {
  const requestUrl = new URL(params.url);
  requestUrl.search = "?success=true";
  const successUrl = requestUrl.toString();
  requestUrl.search = "?cancel=true";
  const cancelUrl = requestUrl.toString();

  const session = await stripe.checkout.sessions.create({
    customer_email: params.email || undefined, // email field is read-only on form if set
    payment_intent_data: {
      metadata: {
        post_id: params.postId,
      },
    },
    line_items: params.lineItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.description,
        },
        tax_behavior: "exclusive",
        unit_amount: item.unit_amount,
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    automatic_tax: { enabled: true },
  });

  return session;
}

type GetPostPaymentStatusResultType = {
  checkoutSession?: PostCheckoutSession;
  isPaid: boolean;
  postCheckoutSessionId?: string;
};

export async function getPostPaymentStatus(
  postId: string
): Promise<GetPostPaymentStatusResultType> {
  const sessions = await getCheckoutSessionsByPostId(postId);

  const latestSession = sessions[0];

  if (!latestSession) return { isPaid: false };
  if (latestSession.session_status === "paid") {
    return {
      checkoutSession: latestSession,
      isPaid: true,
      postCheckoutSessionId: latestSession.id,
    };
  }

  const data = latestSession.session_data as unknown as Stripe.Checkout.Session;

  const latestSessionId = data.id;
  if (!latestSessionId || typeof latestSessionId !== "string")
    return { isPaid: false };

  try {
    const sessionData = await stripe.checkout.sessions.retrieve(
      latestSessionId
    );

    const checkoutSession = await updatePostCheckoutSessionRecord({
      postCheckoutSessionId: latestSession.id,
      sessionData: sessionData,
    });

    // publish post if paid
    const isPaid = sessionData.payment_status === "paid";
    await publishPost({
      daysToPin: checkoutSession?.pinned_duration_in_days,
      daysToPublish: checkoutSession?.post_duration_in_days,
      postId,
    });

    return {
      checkoutSession,
      isPaid,
      postCheckoutSessionId: latestSession.id,
    };
    // const sessionResults = await stripe.checkout.sessions.list({ limit: 5 });
    // console.log("sessionResults", sessionResults);
    // const sessionResult = sessionResults.data[0];
    // return sessionResult.payment_status === "paid";
  } catch (error) {
    console.log("error", error);
  }

  return { isPaid: false };
}

async function updatePostCheckoutSessionRecord({
  postCheckoutSessionId,
  sessionData,
}: {
  postCheckoutSessionId: string;
  sessionData: Stripe.Checkout.Session;
}) {
  if (sessionData.payment_status === "paid" && postCheckoutSessionId) {
    return updateSessionStatus({
      session_data: sessionData,
      id: postCheckoutSessionId,
    });
  }
}
