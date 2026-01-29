/**
 * Paddle adapter for web billing (IBillingService).
 * Use only when Platform.OS === 'web'; BillingProvider selects PaddleAdapter vs RevenueCatAdapter by platform.
 * Uses @paddle/paddle-js (dynamic import so the package is not loaded on mobile).
 */

export { PaddleAdapter } from "./PaddleAdapter";
export { ensurePaddleInitialized, getPaddleInstance, getPaddleToken } from "./paddleLoader";
