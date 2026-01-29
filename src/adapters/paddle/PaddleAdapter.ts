/**
 * PaddleAdapter – IBillingService implementation for web using Paddle.js.
 * Only intended for use on web (Platform.OS === 'web'); BillingProvider injects it conditionally.
 */

import Constants from "expo-constants";
import type { IBillingService } from "../../services/billing/IBillingService";
import type { Offerings, Product, PurchaseOptions, PurchaseResult, RestoreResult } from "../../services/billing/types";
import { clearPurchaseResolver, ensurePaddleInitialized, getPaddleInstance, setPurchaseResolver } from "./paddleLoader";

function getEnv(key: string): string {
  return (Constants.expoConfig?.extra as Record<string, string>)?.[key] ?? (process.env[key] as string) ?? "";
}

const PRICE_ID_MONTHLY = getEnv("EXPO_PUBLIC_PADDLE_PRICE_ID_MONTHLY");
const PRICE_ID_ANNUAL = getEnv("EXPO_PUBLIC_PADDLE_PRICE_ID_ANNUAL");

export class PaddleAdapter implements IBillingService {
  async getOfferings(): Promise<Offerings> {
    await ensurePaddleInitialized();
    const Paddle = getPaddleInstance();

    const monthly: Product = {
      id: PRICE_ID_MONTHLY,
      identifier: PRICE_ID_MONTHLY,
      title: "Pro - Mensual",
      description: "Plan mensual",
      price: "—",
    };
    const annual: Product = {
      id: PRICE_ID_ANNUAL,
      identifier: PRICE_ID_ANNUAL,
      title: "Pro - Anual",
      description: "Plan anual",
      price: "—",
    };

    if (Paddle?.PricePreview) {
      try {
        const [monthlyPreview, annualPreview] = await Promise.all([
          Paddle.PricePreview({ items: [{ priceId: PRICE_ID_MONTHLY, quantity: 1 }] }),
          Paddle.PricePreview({ items: [{ priceId: PRICE_ID_ANNUAL, quantity: 1 }] }),
        ]);

        console.log({ monthlyPreview, annualPreview });

        const lineMonthly = monthlyPreview?.data?.details?.lineItems?.[0];
        const lineAnnual = annualPreview?.data?.details?.lineItems?.[0];

        // Monthly price details
        const mTotal = lineMonthly?.formattedTotals?.total ?? "—";
        const mSubtotal = lineMonthly?.formattedTotals?.subtotal ?? "—";
        const mTax = lineMonthly?.formattedTotals?.tax ?? "—";
        monthly.price = mTotal;
        monthly.priceDetails = { total: mTotal, subtotal: mSubtotal, tax: mTax };
        monthly.currencyCode = monthlyPreview?.data?.currencyCode;

        // Annual price details
        const aTotal = lineAnnual?.formattedTotals?.total ?? "—";
        const aSubtotal = lineAnnual?.formattedTotals?.subtotal ?? "—";
        const aTax = lineAnnual?.formattedTotals?.tax ?? "—";
        annual.price = aTotal;
        annual.priceDetails = { total: aTotal, subtotal: aSubtotal, tax: aTax };
        annual.currencyCode = annualPreview?.data?.currencyCode;
      } catch {
        // keep default '—'
      }
    }

    return { products: [monthly, annual] };
  }

  async purchase(productIdOrPlanId: string, options?: PurchaseOptions): Promise<PurchaseResult> {
    if (!productIdOrPlanId) {
      return { success: false, error: "Missing price id" };
    }
    await ensurePaddleInitialized();
    const Paddle = getPaddleInstance();
    if (!Paddle?.Checkout?.open) {
      return { success: false, error: "Paddle Checkout not available" };
    }

    // Build customData with userId and any extra data
    const customData: Record<string, string> = {
      ...options?.customData,
    };
    if (options?.userId) {
      customData.userId = options.userId;
    }

    return new Promise<PurchaseResult>((resolve) => {
      setPurchaseResolver(resolve, productIdOrPlanId);
      try {
        const locale = options?.locale ?? "en";
        Paddle.Checkout.open({
          items: [{ priceId: productIdOrPlanId, quantity: 1 }],
          // Customer info (email pre-filled in checkout)
          customer: options?.email ? { email: options.email } : undefined,
          // Custom data sent to webhooks (userId for your backend)
          customData: Object.keys(customData).length > 0 ? customData : undefined,
          settings: { displayMode: "overlay", theme: "light", locale },
        });
      } catch (err) {
        clearPurchaseResolver();
        resolve({
          success: false,
          error: err instanceof Error ? err.message : "Checkout failed",
        });
      }
    });
  }

  async restorePurchases(): Promise<RestoreResult> {
    await ensurePaddleInitialized();
    return { success: true };
  }
}
