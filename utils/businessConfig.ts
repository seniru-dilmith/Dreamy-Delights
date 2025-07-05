/**
 * Business configuration utilities
 * Handles environment variables for tax and delivery calculations
 */

export interface BusinessConfig {
  taxPercentage: number;
  deliveryFee: number;
}

/**
 * Get business configuration from environment variables
 * @returns {BusinessConfig} The business configuration
 */
export function getBusinessConfig(): BusinessConfig {
  const taxPercentage = parseFloat(process.env.NEXT_PUBLIC_TAX_PERCENTAGE || '0.00');
  const deliveryFee = parseFloat(process.env.NEXT_PUBLIC_DELIVERY_FEE || '0.00');

  return {
    taxPercentage,
    deliveryFee,
  };
}

/**
 * Calculate order totals including tax and delivery
 * @param {number} subtotal - The subtotal amount
 * @returns {Object} Calculated totals
 */
export function calculateOrderTotals(subtotal: number) {
  const config = getBusinessConfig();
  const taxAmount = subtotal * config.taxPercentage;
  const finalTotal = subtotal + taxAmount + config.deliveryFee;

  return {
    subtotal,
    taxAmount,
    deliveryFee: config.deliveryFee,
    taxPercentage: config.taxPercentage,
    finalTotal,
  };
}

/**
 * Format delivery message based on current delivery fee
 * @returns {string} Formatted delivery message
 */
export function getDeliveryMessage(): string {
  const config = getBusinessConfig();
  return config.deliveryFee === 0 
    ? 'Free delivery on all orders!' 
    : `Delivery fee: Rs. ${config.deliveryFee.toFixed(2)}`;
}

/**
 * Get delivery FAQ answer based on current delivery fee
 * @returns {string} Formatted delivery FAQ answer
 */
export function getDeliveryFAQAnswer(): string {
  const config = getBusinessConfig();
  return `Yes! We offer ${
    config.deliveryFee === 0 
      ? 'free delivery' 
      : `delivery for Rs. ${config.deliveryFee.toFixed(2)}`
  } within a 10km radius of our bakery.`;
}
