/**
 * Merge repeated product IDs into a single quantity while preserving the
 * order in which each product first appeared in the request.
 * @param {Array<{ id: string, quantity: number }>} items
 * @returns {Array<[string, number]>}
 */
export function aggregateOrderItems(items) {
  const quantities = new Map();
  for (const item of items) {
    quantities.set(item.id, (quantities.get(item.id) || 0) + item.quantity);
  }
  return Array.from(quantities.entries());
}

/**
 * Check the existing per-product order quantity limit after aggregation.
 * @param {Array<[string, number]>} quantities
 * @param {number} [maximum]
 * @returns {boolean}
 */
export function hasExcessOrderQuantity(quantities, maximum = 100) {
  return quantities.some(([, quantity]) => quantity > maximum);
}
