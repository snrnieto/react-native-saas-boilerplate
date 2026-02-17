/**
 * Subscription (Paywall) Screen
 *
 * Shows subscription status and products. Uses BillingProvider (payment) and
 * SubscriptionProvider (state). If user is already Pro, shows status; otherwise
 * shows products and purchase/restore flow.
 */

import { useBilling } from "@/src/providers/billing";
import { useSubscription } from "@/src/providers/subscription";
import { useAuth } from "@/src/providers/auth";
import { useTheme } from "@/src/ui/ThemeProvider";
import { Button, Card } from "@/src/ui/components";
import { useToast } from "@/src/ui/components/Toast/ToastContext";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import type { Product } from "@/src/services/billing/types";

export default function SubscriptionScreen() {
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;
  const { user } = useAuth();
  const { isActive, planType, isLoading: subLoading, refetch, status } = useSubscription();
  const {
    getOfferings,
    purchase,
    restorePurchases,
    isNativePlaceholder,
  } = useBilling();
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [offeringsLoading, setOfferingsLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const loadOfferings = useCallback(async () => {
    try {
      setOfferingsLoading(true);
      const offerings = await getOfferings();
      setProducts(offerings.products ?? []);
    } catch (err) {
      console.error("Failed to load offerings", err);
      showError("Failed to load plans", { position: "bottom" });
      setProducts([]);
    } finally {
      setOfferingsLoading(false);
    }
  }, [getOfferings, showError]);

  useEffect(() => {
    if (!isNativePlaceholder) {
      loadOfferings();
    } else {
      setOfferingsLoading(false);
    }
  }, [isNativePlaceholder, loadOfferings]);

  const handlePurchase = async (product: Product) => {
    if (!user) return;
    try {
      setPurchasingId(product.id);
      const result = await purchase(product.identifier, {
        email: user.email ?? undefined,
        userId: user.id,
      });
      if (result.success) {
        showSuccess("Purchase successful", { position: "bottom" });
        await refetch();
      } else if (result.error && !result.error.toLowerCase().includes("cancelled")) {
        showError(result.error, { position: "bottom" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Purchase failed";
      showError(msg, { position: "bottom" });
    } finally {
      setPurchasingId(null);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      const result = await restorePurchases();
      if (result.success) {
        await refetch();
        showSuccess("Purchases restored", { position: "bottom" });
      } else if (result.error) {
        showError(result.error, { position: "bottom" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Restore failed";
      showError(msg, { position: "bottom" });
    } finally {
      setRestoring(false);
    }
  };

  const isLoading = subLoading;
  const isPro = isActive && planType === "PRO";

  if (isLoading && status === null && user) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background.primary,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.md, color: colors.text.secondary }}>
          Loading subscription…
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingBottom: 40,
      }}
    >
      <View style={{ maxWidth: 600, width: "100%", alignSelf: "center", gap: spacing.lg }}>
        {/* Header */}
        <View style={{ marginBottom: spacing.sm }}>
          <Text
            style={{
              fontSize: typography.fontSize["3xl"],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginBottom: spacing.xs,
            }}
          >
            Subscription
          </Text>
          <Text
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.secondary,
            }}
          >
            {isPro
              ? "You have an active Pro subscription."
              : "Upgrade to Pro to unlock all features."}
          </Text>
        </View>

        {/* Already Pro */}
        {isPro && (
          <Card variant="elevated" padding="lg">
            <View style={{ gap: spacing.md }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.primary,
                  }}
                >
                  Pro
                </Text>
                {status?.cancelAtPeriodEnd && (
                  <Text
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                    }}
                  >
                    (Cancels at period end)
                  </Text>
                )}
              </View>
              {status?.currentPeriodEnd && (
                <Text
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                  }}
                >
                  Current period ends:{" "}
                  {new Date(status.currentPeriodEnd).toLocaleDateString()}
                </Text>
              )}
              <Button variant="secondary" onPress={refetch}>
                Refresh status
              </Button>
            </View>
          </Card>
        )}

        {/* Products (only when not Pro and billing available) */}
        {!isPro && !isNativePlaceholder && (
          <>
            <Text
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
              }}
            >
              Plans
            </Text>
            {offeringsLoading ? (
              <View style={{ padding: spacing.xl, alignItems: "center" }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : products.length === 0 ? (
              <Card variant="outlined" padding="lg">
                <Text style={{ color: colors.text.secondary }}>
                  No plans available at the moment.
                </Text>
              </Card>
            ) : (
              <View style={{ gap: spacing.md }}>
                {products.map((product) => (
                  <Card key={product.id} variant="outlined" padding="lg">
                    <View style={{ gap: spacing.sm }}>
                      <Text
                        style={{
                          fontSize: typography.fontSize.lg,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.text.primary,
                        }}
                      >
                        {product.title}
                      </Text>
                      {product.description && (
                        <Text
                          style={{
                            fontSize: typography.fontSize.sm,
                            color: colors.text.secondary,
                          }}
                        >
                          {product.description}
                        </Text>
                      )}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: spacing.sm,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: typography.fontSize.xl,
                            fontWeight: typography.fontWeight.bold,
                            color: colors.primary,
                          }}
                        >
                          {product.price}
                        </Text>
                        <Button
                          variant="primary"
                          onPress={() => handlePurchase(product)}
                          loading={purchasingId === product.id}
                          disabled={!!purchasingId}
                        >
                          Subscribe
                        </Button>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            <Button
              variant="ghost"
              onPress={handleRestore}
              loading={restoring}
              disabled={restoring}
            >
              Restore purchases
            </Button>
          </>
        )}

        {/* Native: billing not yet implemented */}
        {!isPro && isNativePlaceholder && (
          <Card variant="outlined" padding="lg">
            <Text style={{ color: colors.text.secondary }}>
              In-app purchases on this device will be available soon. Use the web app to subscribe.
            </Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
