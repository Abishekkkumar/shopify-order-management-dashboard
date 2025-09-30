const { getShopifyOrders, createShopifyOrder } = require('../service/shopifyService');
const Order = require('../models/order');

// @desc    Get all orders from our database
// @route   GET /api/orders
// @access  Public
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({});
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Error getting orders from DB:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Sync orders from Shopify to our database
// @route   POST /api/orders/sync
// @access  Public
const syncOrdersWithShopify = async (req, res) => {
  try {
    const shopifyOrders = await getShopifyOrders();
    let newCount = 0;
    let updatedCount = 0;

    for (const shopifyOrder of shopifyOrders) {
      const existingOrder = await Order.findOne({ shopify_order_id: shopifyOrder.id });

      const orderData = {
        shopify_order_id: shopifyOrder.id,
        order_number: shopifyOrder.order_number,
        customer: shopifyOrder.customer,
        total_price: shopifyOrder.total_price,
        financial_status: shopifyOrder.financial_status,
        fulfillment_status: shopifyOrder.fulfillment_status,
        created_at: shopifyOrder.created_at,
      };

      if (existingOrder) {
        await Order.updateOne({ shopify_order_id: shopifyOrder.id }, orderData);
        updatedCount++;
      } else {
        await Order.create(orderData);
        newCount++;
      }
    }
    console.log(`Sync complete. New: ${newCount}, Updated: ${updatedCount}`);
    res.status(200).json({
      success: true,
      message: 'Orders synced successfully.',
      new: newCount,
      updated: updatedCount,
    });
  } catch (error) {
    console.error('Sync failed:', error);
    res.status(500).json({ success: false, error: 'Failed to sync orders.' });
  }
};


// @desc    Create a new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    // 1. Send the order data from the request body to Shopify
    const newShopifyOrder = await createShopifyOrder(req.body);

    // 2. Save the newly created order to our own MongoDB database
    const newOrder = new Order({
      shopify_order_id: newShopifyOrder.id,
      order_number: newShopifyOrder.order_number,
      customer: newShopifyOrder.customer,
      total_price: newShopifyOrder.total_price,
      financial_status: newShopifyOrder.financial_status,
      fulfillment_status: newShopifyOrder.fulfillment_status,
      created_at: newShopifyOrder.created_at,
    });
    await newOrder.save();
    
    console.log(`Successfully created and saved order #${newShopifyOrder.order_number}`);

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: newShopifyOrder,
    });
  } catch (error) {
    console.error('Error in createOrder controller:', error.message);
    res.status(500).json({ success: false, error: 'Failed to create order.' });
  }
};


module.exports = {
  getOrders,
  syncOrdersWithShopify,
  createOrder,
};