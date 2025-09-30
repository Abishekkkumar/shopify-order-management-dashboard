const mongoose = require('mongoose');

const LineItemSchema = new mongoose.Schema({
  shopify_line_item_id: { type: Number, required: true },
  title: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: String, required: true },
  sku: { type: String },
});

const OrderSchema = new mongoose.Schema({
  shopify_order_id: {
    type: Number,
    required: true,
    unique: true, // Ensures we don't duplicate orders
  },
  order_number: {
    type: String,
    required: true,
  },
  customer: {
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String },
  },
  total_price: {
    type: String,
    required: true,
  },
  financial_status: {
    type: String,
    required: true,
  },
  fulfillment_status: {
    type: String,
    default: 'unfulfilled',
  },
  line_items: [LineItemSchema],
  created_at: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps to our records
});

module.exports = mongoose.model('Order', OrderSchema);