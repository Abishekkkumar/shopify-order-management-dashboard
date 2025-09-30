const axios = require('axios');

// Load environment variables
const SHOPIFY_SHOP_URL = process.env.SHOPIFY_SHOP_URL;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

// Prepare headers for Shopify API requests
const headers = {
  'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
  'Content-Type': 'application/json',
};

/**
 * Fetches all orders from the Shopify store.
 * @returns {Promise<Array>} A list of order objects from Shopify.
 */
const getShopifyOrders = async () => {
  const url = `https://${SHOPIFY_SHOP_URL}/admin/api/2025-07/orders.json?status=any`;
  console.log('Fetching orders from Shopify...');
  try {
    const response = await axios.get(url, { headers });
    return response.data.orders;
  } catch (error) {
    console.error('Error fetching Shopify orders:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch orders from Shopify.');
  }
};

/**
 * Creates a new order in Shopify.
 * @param {object} orderData - The data for the new order.
 * @returns {Promise<object>} The newly created order object from Shopify.
 */
const createShopifyOrder = async (orderData) => {
  const url = `https://${SHOPIFY_SHOP_URL}/admin/api/2025-07/orders.json`;
  console.log('Sending new order to Shopify...');
  try {
    const response = await axios.post(url, orderData, { headers });
    return response.data.order;
  } catch (error) {
    console.error('Error creating Shopify order:', error.response ? error.response.data : error.message);
    throw new Error('Failed to create order in Shopify.');
  }
};

module.exports = {
  getShopifyOrders,
  createShopifyOrder,
};