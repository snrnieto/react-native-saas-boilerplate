/**
 * Paddle.js loader for web using @paddle/paddle-js (dynamic import so it never loads on mobile).
 * Ensures Paddle is initialized once with client-side token and eventCallback for purchase flow.
 */

import type { Paddle } from "@paddle/paddle-js";
import Constants from "expo-constants";
import type { PurchaseResult } from "../../services/billing/types";

const PADDLE_TOKEN =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_PADDLE_CLIENT_TOKEN ??
  process.env.EXPO_PUBLIC_PADDLE_CLIENT_TOKEN ??
  "";

const PADDLE_ENVIRONMENT =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_PADDLE_ENVIRONMENT ??
  process.env.EXPO_PUBLIC_PADDLE_ENVIRONMENT ??
  "";

let paddleInstance: Paddle | undefined;
let initialized = false;
let initPromise: Promise<void> | null = null;
let purchaseResolve: ((result: PurchaseResult) => void) | null = null;
let purchasePriceId: string | null = null;

/**
 * Initialize Paddle.js once via @paddle/paddle-js (dynamic import).
 * Only runs when called from PaddleAdapter, which is only used on web.
 */
export async function ensurePaddleInitialized(): Promise<void> {
  if (initialized && paddleInstance) {
    return;
  }
  if (initPromise) {
    return initPromise;
  }
  initPromise = (async () => {
    const { initializePaddle } = await import("@paddle/paddle-js");
    const env: "sandbox" | "production" =
      PADDLE_ENVIRONMENT === "sandbox" ? "sandbox" : "production";
    paddleInstance = await initializePaddle({
      token: PADDLE_TOKEN,
      environment: env,
      eventCallback: (event) => {
        if (event.name === "checkout.completed" && purchaseResolve) {
          purchaseResolve({ success: true, productId: purchasePriceId ?? undefined });
          purchaseResolve = null;
          purchasePriceId = null;
        }
        if (event.name === "checkout.closed" && purchaseResolve) {
          purchaseResolve({ success: false, error: "Checkout closed" });
          purchaseResolve = null;
          purchasePriceId = null;
        }
      },
    });
    initialized = Boolean(paddleInstance);
  })();
  return initPromise;
}

/**
 * Get the Paddle instance after ensurePaddleInitialized(). Only defined on web.
 */
export function getPaddleInstance(): Paddle | undefined {
  return paddleInstance;
}

export function setPurchaseResolver(resolve: (result: PurchaseResult) => void, priceId: string): void {
  purchaseResolve = resolve;
  purchasePriceId = priceId;
}

export function clearPurchaseResolver(): void {
  purchaseResolve = null;
  purchasePriceId = null;
}

export function getPaddleToken(): string {
  return PADDLE_TOKEN;
}
