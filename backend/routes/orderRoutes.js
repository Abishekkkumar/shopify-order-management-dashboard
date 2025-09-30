const express = require('express');
const router = express.Router();

// This line was missing or incorrect. It imports your controller functions.
const {
  getOrders,
  syncOrdersWithShopify,
  createOrder,
} = require('../controllers/orderController');

// Defines the API endpoints for orders

// GET /api/orders -> Fetches all orders from the local database
router.get('/', getOrders);

// POST /api/orders/sync -> Triggers a sync with Shopify
router.post('/sync', syncOrdersWithShopify);

// POST /api/orders -> Creates a new order in Shopify and saves it locally
router.post('/', createOrder);

module.exports = router;

