/**
 * RevenueCat adapter for native billing (IBillingService).
 *
 * Use when Platform.OS === 'ios' | 'android'; BillingProvider selects
 * PaddleAdapter (web) vs this adapter (native) by platform.
 *
 * Current: NativeBillingPlaceholder (Task 4.4 will replace with RevenueCatAdapter
 * using react-native-purchases).
 */

export { NativeBillingPlaceholder } from "./NativeBillingPlaceholder";
