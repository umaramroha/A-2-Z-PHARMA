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
/**
 * Keep payment states consistent with the order and the two supported methods.
 * A failed payment applies only to manual UPI; refunds apply only after cancellation.
 * @param {OrderStatus} orderStatus
 * @param {string} paymentMethod
 * @param {PaymentStatus} nextPaymentStatus
 */
export function canSetPaymentStatusForOrder(orderStatus, paymentMethod, nextPaymentStatus) {
  if (nextPaymentStatus === "PAID") {
    if (orderStatus === "CANCELLED") return false;
    // COD is collected at delivery; do not let staff mark it paid earlier.
    if (paymentMethod === "cod" && orderStatus !== "DELIVERED") return false;
  }
  if (nextPaymentStatus === "FAILED" && paymentMethod !== "upi") return false;
  if (
    nextPaymentStatus === "REFUNDED" &&
    orderStatus !== "CANCELLED" &&
    orderStatus !== "DELIVERED"
  ) return false;
  return true;
}


/**
 * Manual UPI must be verified before an order can leave the processing stage.
 * COD remains payable at delivery.
 * @param {string} nextOrderStatus
 * @param {string} paymentMethod
 * @param {string} paymentStatus
 */
export function canMoveOrderWithPayment(nextOrderStatus, paymentMethod, paymentStatus) {
  if (nextOrderStatus === "SHIPPED" || nextOrderStatus === "DELIVERED") {
    return paymentMethod !== "upi" || paymentStatus === "PAID";
  }
  return true;
}
