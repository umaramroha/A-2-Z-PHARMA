/**
 * Shared A-2-Z delivery pricing constants and pure calculator.
 * Amounts are compared using their integer part so decimal currency values
 * are not rounded through floating-point arithmetic at the free-delivery edge.
 */
/** @type {Readonly<{ fee: number, freeAbove: number }>} */
export const deliveryConfig = Object.freeze({
  fee: 50,
  freeAbove: 500,
});

/**
 * @param {number | string} subtotal Non-negative rupee amount.
 * @returns {number} Delivery fee in rupees.
 */
export function calculateDeliveryFee(subtotal) {
  const match = /^(\d+)(?:\.\d+)?$/.exec(String(subtotal).trim());

  if (!match) {
    throw new TypeError("Subtotal must be a non-negative decimal amount");
  }

  return BigInt(match[1]) >= BigInt(deliveryConfig.freeAbove)
    ? 0
    : deliveryConfig.fee;
}
