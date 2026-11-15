/**
 * 🔄 FORGOT PIN SUITE - AGENT INDEX MANIFEST
 * =========================================
 * Sub-components powering the 4-step PIN reset workflow.
 * All files strictly below 300 lines.
 *
 * 1. ForgotEmailStep.tsx (~55 lines) - Identity verification & OTP request
 * 2. ForgotOtpStep.tsx (~120 lines) - 6-digit numeric OTP code entry & countdown
 * 3. ForgotNewPinStep.tsx (~85 lines) - New PIN creation and confirmation
 * 4. ForgotSuccessStep.tsx (~35 lines) - Success alert & immediate sign-in button
 */

export { default as ForgotEmailStep } from './ForgotEmailStep';
export { default as ForgotOtpStep } from './ForgotOtpStep';
export { default as ForgotNewPinStep } from './ForgotNewPinStep';
export { default as ForgotSuccessStep } from './ForgotSuccessStep';
