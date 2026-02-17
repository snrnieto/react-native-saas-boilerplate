/**
 * SubscriptionContext
 *
 * Provides subscription state (isActive, planType) globally for the paywall and the rest of the app.
 * Subscription service is injected (e.g. SupabaseSubscriptionAdapter). Uses auth user id to fetch status.
 */

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ISubscriptionService } from "../../services/subscription/ISubscriptionService";
import type { PlanType, SubscriptionStatusResult } from "../../services/subscription/types";
import { useAuth } from "../auth";

export interface SubscriptionContextValue {
  /** Whether the user has an active subscription (ACTIVE or TRIALING). */
  isActive: boolean;
  /** Effective plan: FREE or PRO. */
  planType: PlanType;
  /** Loading subscription status. */
  isLoading: boolean;
  /** Error from last fetch, if any. */
  error: Error | null;
  /** Refetch subscription status (e.g. after purchase or restore). */
  refetch: () => Promise<void>;
  /** Full status result for UI (periods, cancelAtPeriodEnd, etc.). */
  status: SubscriptionStatusResult | null;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export interface SubscriptionProviderProps {
  subscriptionService: ISubscriptionService;
  children: ReactNode;
}

export function SubscriptionProvider({ subscriptionService, children }: SubscriptionProviderProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatusResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadStatus = useCallback(async () => {
    if (!user) {
      setStatus(null);
      setError(null);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const result = await subscriptionService.getSubscriptionStatus(user.id);
      setStatus(result);
    } catch (err) {
      console.error("Failed to load subscription status", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, subscriptionService]);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      if (!user) {
        if (isMounted) {
          setStatus(null);
          setError(null);
          setIsLoading(false);
        }
        return;
      }
      try {
        if (isMounted) setIsLoading(true);
        const result = await subscriptionService.getSubscriptionStatus(user.id);
        if (isMounted) setStatus(result);
      } catch (err) {
        console.error("Failed to load subscription status", err);
        if (isMounted) setError(err instanceof Error ? err : new Error(String(err)));
        if (isMounted) setStatus(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, [user?.id, subscriptionService]);

  const refetch = useCallback(async () => {
    await loadStatus();
  }, [loadStatus]);

  const contextValue: SubscriptionContextValue = {
    isActive: status?.isActive ?? false,
    planType: status?.planType ?? "FREE",
    isLoading,
    error,
    refetch,
    status,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
