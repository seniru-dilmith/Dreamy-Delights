/**
 * Business configuration for backend services
 * Reads from environment variables for tax and delivery settings
 */

/**
 * Get business configuration from environment variables
 * @return {Object} Business configuration object
 */
function getBusinessConfig() {
  const taxPercentage = parseFloat(process.env.TAX_PERCENTAGE || "0.00");
  const deliveryFee = parseFloat(process.env.DELIVERY_FEE || "0.00");

  return {
    taxPercentage,
    deliveryFee,
  };
}

/**
 * Calculate order totals including tax and delivery
 * @param {number} subtotal - The subtotal amount
 * @return {Object} Calculated totals
 */
function calculateOrderTotals(subtotal) {
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

module.exports = {
  getBusinessConfig,
  calculateOrderTotals,
};
