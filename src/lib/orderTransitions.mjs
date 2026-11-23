/**
 * Pure order/payment transition rules shared by the admin API and unit tests.
 * @typedef {"PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"} OrderStatus
 * @typedef {"PENDING" | "PAID" | "FAILED" | "REFUNDED"} PaymentStatus
 */
/** @type {readonly ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]} */
export const VALID_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
/** @type {readonly ["PENDING", "PAID", "FAILED", "REFUNDED"]} */
export const VALID_PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];
/** @type {Record<OrderStatus, number>} */
const STATUS_ORDER = { PENDING: 0, CONFIRMED: 1, PROCESSING: 2, SHIPPED: 3, DELIVERED: 4, CANCELLED: -1 };
/** @param {OrderStatus} current @param {OrderStatus} next */
export function canTransitionStatus(current, next) {
  if (current === next || current === "CANCELLED" || current === "DELIVERED") return false;
  if (next === "CANCELLED") return ["PENDING", "CONFIRMED", "PROCESSING"].includes(current);
  return STATUS_ORDER[next] > STATUS_ORDER[current];
}
/** @param {PaymentStatus} current @param {PaymentStatus} next */
export function canTransitionPayment(current, next) {
  if (current === next || current === "REFUNDED") return false;
  if (current === "PENDING") return next === "PAID" || next === "FAILED";
  if (current === "FAILED") return next === "PENDING";
  return current === "PAID" && next === "REFUNDED";
}
