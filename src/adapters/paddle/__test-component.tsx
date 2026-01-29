/**
 * 🧪 ARCHIVO TEMPORAL DE TESTING – PaddleAdapter (IBillingService)
 *
 * Permite probar el PaddleAdapter (getOfferings, purchase) sin el BillingProvider.
 * Solo funciona en web (Paddle.js es client-side).
 *
 * CÓMO USAR:
 * 1. Configura .env: EXPO_PUBLIC_PADDLE_CLIENT_TOKEN, EXPO_PUBLIC_PADDLE_PRICE_ID_MONTHLY, EXPO_PUBLIC_PADDLE_PRICE_ID_ANNUAL
 * 2. En web, importa en app/(tabs)/index.tsx o app/modal.tsx:
 *    import { PaddleBillingTest } from '@/src/adapters/paddle/__test-component';
 * 3. Añade en el JSX: <PaddleBillingTest userEmail={user.email} userId={user.id} />
 * 4. Prueba: Config → Load offerings → Purchase (monthly/annual)
 *
 * ELIMINAR ESTE ARCHIVO cuando termines el testing.
 */

export interface PaddleBillingTestProps {
  /** User email (pre-filled in Paddle checkout). */
  userEmail?: string;
  /** Your internal user ID (sent to Paddle webhooks as customData.userId). */
  userId?: string;
}

import Constants from "expo-constants";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Product } from "../../services/billing/types";
import { Button } from "../../ui/components/Button";
import { Modal } from "../../ui/components/Modal";
import { PaddleAdapter } from "./PaddleAdapter";
import { getPaddleToken } from "./paddleLoader";

function getEnv(key: string): string {
  return (Constants.expoConfig?.extra as Record<string, string>)?.[key] ?? (process.env[key] as string) ?? "";
}

function isPaddleConfigured(): boolean {
  const token = getPaddleToken();
  const monthly = getEnv("EXPO_PUBLIC_PADDLE_PRICE_ID_MONTHLY");
  const annual = getEnv("EXPO_PUBLIC_PADDLE_PRICE_ID_ANNUAL");
  return Boolean(token && (monthly || annual));
}

const billingService = new PaddleAdapter();

function AlertModal({
  visible,
  title,
  message,
  onClose,
}: {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} onClose={onClose} showOverlay closeOnOverlayPress>
      <View style={styles.dialogContent}>
        <Text style={styles.dialogTitle}>{title}</Text>
        <Text style={styles.dialogMessage}>{message}</Text>
        <Button variant="primary" onPress={onClose}>
          OK
        </Button>
      </View>
    </Modal>
  );
}

export function PaddleBillingTest({ userEmail, userId }: PaddleBillingTestProps) {
  const { i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  const addLog = (message: string) => {
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 12));
  };

  const showDialog = (title: string, message: string) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogVisible(true);
  };

  // Test 1: Verificar configuración
  const testConfig = async () => {
    const configured = isPaddleConfigured();
    addLog(`Paddle configurado: ${configured}`);

    if (!configured) {
      showDialog(
        "❌ Paddle no configurado",
        "Revisa .env:\n\n" +
        "• EXPO_PUBLIC_PADDLE_CLIENT_TOKEN (token cliente de Paddle Dashboard)\n" +
        "• EXPO_PUBLIC_PADDLE_PRICE_ID_MONTHLY (pri_xxx)\n" +
        "• EXPO_PUBLIC_PADDLE_PRICE_ID_ANNUAL (pri_xxx)\n\n" +
        "Solo disponible en web."
      );
      return;
    }

    addLog("🔍 Inicializando Paddle...");
    try {
      const { ensurePaddleInitialized } = await import("./paddleLoader");
      await ensurePaddleInitialized();
      addLog("✅ Paddle inicializado");
      showDialog(
        "✅ Configuración OK",
        "Token y price IDs configurados.\nPaddle.js inicializado.\n\nSolo en web: abre checkout con los botones de compra."
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`❌ Error: ${msg}`);
      showDialog("❌ Error", msg);
    }
  };

  // Test 2: Cargar offerings (getOfferings)
  const testGetOfferings = async () => {
    setLoading(true);
    addLog("📦 Cargando offerings...");
    try {
      const offerings = await billingService.getOfferings();
      console.log({ offerings })
      setProducts(offerings.products);
      addLog(`✅ ${offerings.products.length} producto(s) cargado(s)`);
      if (offerings.products.length === 0) {
        showDialog("⚠️ Sin productos", "getOfferings() devolvió 0 productos. Revisa los price IDs en .env.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`❌ getOfferings: ${msg}`);
      showDialog("❌ getOfferings", msg);
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Compra (monthly)
  const testPurchaseMonthly = async () => {
    const priceId = getEnv("EXPO_PUBLIC_PADDLE_PRICE_ID_MONTHLY");
    if (!priceId) {
      addLog("❌ Falta EXPO_PUBLIC_PADDLE_PRICE_ID_MONTHLY");
      showDialog("❌ Falta price ID", "Configura EXPO_PUBLIC_PADDLE_PRICE_ID_MONTHLY en .env");
      return;
    }
    setLoading(true);
    addLog(`🛒 Abriendo checkout (mensual) para ${userEmail ?? "sin email"}...`);
    try {
      const result = await billingService.purchase(priceId, {
        email: userEmail,
        userId: userId,
        locale: i18n.language,
      });
      if (result.success) {
        addLog(`✅ Compra completada: ${result.productId ?? priceId}`);
        showDialog("✅ Compra OK", `Checkout completado (mensual).\nUserId: ${userId ?? "N/A"}\nEmail: ${userEmail ?? "N/A"}`);
      } else {
        addLog(`❌ Compra: ${result.error ?? "cancelado"}`);
        showDialog("Compra", result.error ?? "Checkout cerrado o cancelado.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`❌ purchase: ${msg}`);
      showDialog("❌ purchase", msg);
    } finally {
      setLoading(false);
    }
  };

  // Test 4: Compra (annual)
  const testPurchaseAnnual = async () => {
    const priceId = getEnv("EXPO_PUBLIC_PADDLE_PRICE_ID_ANNUAL");
    if (!priceId) {
      addLog("❌ Falta EXPO_PUBLIC_PADDLE_PRICE_ID_ANNUAL");
      showDialog("❌ Falta price ID", "Configura EXPO_PUBLIC_PADDLE_PRICE_ID_ANNUAL en .env");
      return;
    }
    setLoading(true);
    addLog(`🛒 Abriendo checkout (anual) para ${userEmail ?? "sin email"}...`);
    try {
      const result = await billingService.purchase(priceId, {
        email: userEmail,
        userId: userId,
        locale: i18n.language,
      });
      if (result.success) {
        addLog(`✅ Compra completada: ${result.productId ?? priceId}`);
        showDialog("✅ Compra OK", `Checkout completado (anual).\nUserId: ${userId ?? "N/A"}\nEmail: ${userEmail ?? "N/A"}`);
      } else {
        addLog(`❌ Compra: ${result.error ?? "cancelado"}`);
        showDialog("Compra", result.error ?? "Checkout cerrado o cancelado.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`❌ purchase: ${msg}`);
      showDialog("❌ purchase", msg);
    } finally {
      setLoading(false);
    }
  };

  // Test 5: Restore (no-op en web)
  const testRestore = async () => {
    setLoading(true);
    addLog("🔄 Restore purchases...");
    try {
      const result = await billingService.restorePurchases();
      addLog(result.success ? "✅ Restore OK (no-op en web)" : `❌ ${result.error}`);
      showDialog("Restore", result.success ? "Restore OK (no-op en web)." : (result.error ?? "Error"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`❌ restore: ${msg}`);
      showDialog("❌ restore", msg);
    } finally {
      setLoading(false);
    }
  };

  const dialogClose = () => setDialogVisible(false);

  if (Platform.OS !== "web") {
    return (
      <>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>🧪 Paddle Billing Test</Text>
          </View>
          <View style={styles.onlyWeb}>
            <Text style={styles.onlyWebText}>
              Solo disponible en web. Paddle.js es client-side; en native usa RevenueCat u otro adapter.
            </Text>
          </View>
        </View>
        <AlertModal
          visible={dialogVisible}
          title={dialogTitle}
          message={dialogMessage}
          onClose={dialogClose}
        />
      </>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🧪 Paddle Billing Test</Text>
          <Text style={styles.subtitle}>IBillingService • getOfferings • purchase</Text>
        </View>

        {/* User info (read-only) */}
        <View style={styles.userInfo}>
          <Text style={styles.userInfoLabel}>👤 Usuario:</Text>
          <Text style={styles.userInfoValue}>{userEmail ?? "No logueado"}</Text>
          <Text style={styles.userInfoId}>ID: {userId ?? "N/A"}</Text>
        </View>

        {/* Productos cargados */}
        {products.length > 0 && (
          <View style={styles.products}>
            <Text style={styles.productsTitle}>📦 Productos (getOfferings):</Text>
            {products.map((p) => (
              <View key={p.id} style={styles.productRow}>
                <Text style={styles.productTitle}>{p.title}</Text>
                <Text style={styles.productPrice}>{p.price}</Text>
                {p.priceDetails && (
                  <View style={styles.priceBreakdown}>
                    <Text style={styles.priceDetail}>Subtotal: {p.priceDetails.subtotal}</Text>
                    <Text style={styles.priceDetail}>Tax: {p.priceDetails.tax}</Text>
                    <Text style={styles.priceDetail}>Total: {p.priceDetails.total}</Text>
                  </View>
                )}
                {p.currencyCode && <Text style={styles.productId}>Currency: {p.currencyCode}</Text>}
                <Text style={styles.productId}>{p.id}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.buttons}>
          <TestButton title="1. Config ✓" onPress={testConfig} loading={loading} />
          <TestButton title="2. Load offerings 📦" onPress={testGetOfferings} loading={loading} />
          <TestButton title="3. Purchase monthly 🛒" onPress={testPurchaseMonthly} loading={loading} />
          <TestButton title="4. Purchase annual 🛒" onPress={testPurchaseAnnual} loading={loading} />
          <TestButton title="5. Restore 🔄" onPress={testRestore} loading={loading} />
        </View>

        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>📋 Log:</Text>
          {log.map((entry, index) => (
            <Text key={index} style={styles.logEntry}>
              {entry}
            </Text>
          ))}
        </View>
      </ScrollView>
      <AlertModal
        visible={dialogVisible}
        title={dialogTitle}
        message={dialogMessage}
        onClose={dialogClose}
      />
    </>
  );
}

function TestButton({
  title,
  onPress,
  loading,
}: {
  title: string;
  onPress: () => void;
  loading: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={onPress}
      disabled={loading}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dialogContent: {
    gap: 12,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  dialogMessage: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#0ea5e9",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  onlyWeb: {
    padding: 24,
    margin: 20,
    backgroundColor: "#fef3c7",
    borderRadius: 8,
  },
  onlyWebText: {
    color: "#92400e",
    fontSize: 14,
    textAlign: "center",
  },
  userInfo: {
    margin: 20,
    marginBottom: 0,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  userInfoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  userInfoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  userInfoId: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    fontFamily: "monospace",
  },
  products: {
    margin: 20,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  productsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#374151",
  },
  productRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  productTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0ea5e9",
    marginTop: 4,
  },
  priceBreakdown: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  priceDetail: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  productId: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
    fontFamily: "monospace",
  },
  buttons: {
    padding: 20,
    gap: 10,
  },
  button: {
    backgroundColor: "#0ea5e9",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  logContainer: {
    padding: 20,
    backgroundColor: "#1f2937",
    margin: 20,
    borderRadius: 8,
  },
  logTitle: {
    color: "#34d399",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  logEntry: {
    color: "#e5e7eb",
    fontSize: 12,
    fontFamily: "monospace",
    marginVertical: 2,
  },
});
