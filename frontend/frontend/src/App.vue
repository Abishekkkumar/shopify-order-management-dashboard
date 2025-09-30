<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// The base URL of our backend API
const API_URL = 'http://localhost:5001/api/orders';

// --- State for Displaying Orders ---
const orders = ref([]);
const isLoading = ref(false);
const error = ref(null);

// --- State for Syncing ---
const syncMessage = ref('');
const isSyncing = ref(false);

// --- State for Creating a New Order ---
const isCreating = ref(false);
const createError = ref(null);
const newOrderFirstName = ref('');
const newOrderLastName = ref('');
const newOrderEmail = ref('');
const newOrderVariantId = ref('');


// --- API Functions ---

// Function to fetch orders from our backend database
const fetchOrders = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await axios.get(API_URL);
    // Sort orders by most recent first
    orders.value = response.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    error.value = 'Failed to load orders. Make sure the backend server is running.';
  } finally {
    isLoading.value = false;
  }
};

// Function to trigger the sync process on our backend
const syncOrders = async () => {
  isSyncing.value = true;
  syncMessage.value = '';
  error.value = null;
  try {
    const response = await axios.post(`${API_URL}/sync`);
    syncMessage.value = `Sync successful! New: ${response.data.new}, Updated: ${response.data.updated}.`;
    // After a successful sync, refresh the order list
    await fetchOrders();
  } catch (err) {
    console.error('Failed to sync orders:', err);
    error.value = 'Failed to sync orders. Check the backend console for details.';
  } finally {
    isSyncing.value = false;
  }
};

// Function to create a new order
const handleCreateOrder = async () => {
  if (!newOrderEmail.value || !newOrderVariantId.value || !newOrderFirstName.value || !newOrderLastName.value) {
    createError.value = 'Please fill out all fields to create an order.';
    return;
  }
  isCreating.value = true;
  createError.value = null;
  syncMessage.value = '';

  const orderData = {
    order: {
      line_items: [{
        variant_id: newOrderVariantId.value,
        quantity: 1,
      }],
      customer: {
        first_name: newOrderFirstName.value,
        last_name: newOrderLastName.value,
        email: newOrderEmail.value,
      }
    },
  };

  try {
    await axios.post(API_URL, orderData);
    syncMessage.value = 'Successfully created new order!';
    // Clear the form
    newOrderFirstName.value = '';
    newOrderLastName.value = '';
    newOrderEmail.value = '';
    newOrderVariantId.value = '';
    // Refresh the list to show the new order
    await fetchOrders();
  } catch (err) {
    console.error('Failed to create order:', err);
    createError.value = 'Failed to create order. Is the Variant ID valid?';
  } finally {
    isCreating.value = false;
  }
};


// The onMounted lifecycle hook runs this code when the component is first loaded
onMounted(() => {
  fetchOrders();
});

// Helper function to format date strings for better readability
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
</script>

<template>
  <div id="app">
    <header class="app-header">
      <h1>Shopify Order Dashboard</h1>
      <button @click="syncOrders" :disabled="isSyncing" class="sync-button">
        {{ isSyncing ? 'Syncing...' : 'Sync with Shopify' }}
      </button>
    </header>

    <main class="container">
      <!-- Action/Status Messages -->
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="syncMessage" class="sync-message">{{ syncMessage }}</div>

      <!-- Create Order Form -->
      <div class="card create-order-card">
        <h2>Create New Order</h2>
        <form @submit.prevent="handleCreateOrder" class="create-order-form">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input type="text" id="firstName" v-model="newOrderFirstName" placeholder="John" required>
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input type="text" id="lastName" v-model="newOrderLastName" placeholder="Doe" required>
          </div>
          <div class="form-group">
            <label for="email">Customer Email</label>
            <input type="email" id="email" v-model="newOrderEmail" placeholder="customer@example.com" required>
          </div>
          <div class="form-group">
            <label for="variantId">Product Variant ID</label>
            <input type="text" id="variantId" v-model="newOrderVariantId" placeholder="Enter a valid Variant ID" required>
          </div>
          <div class="form-group form-group-submit">
             <button type="submit" :disabled="isCreating">
              {{ isCreating ? 'Creating...' : 'Create Order' }}
            </button>
          </div>
        </form>
        <div v-if="createError" class="error-message form-error">{{ createError }}</div>
      </div>

      <!-- Orders Display -->
      <div class="card orders-list-card">
        <h2>Existing Orders</h2>
        <div v-if="isLoading" class="loading">Loading orders...</div>
        <div v-if="!isLoading && orders.length > 0" class="orders-table-container">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Payment Status</th>
                <th>Fulfillment Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.shopify_order_id">
                <td>#{{ order.order_number }}</td>
                <td>{{ formatDate(order.created_at) }}</td>
                <td>{{ order.customer?.first_name || 'N/A' }} {{ order.customer?.last_name || '' }}</td>
                <td><span :class="['status-badge', order.financial_status]">{{ order.financial_status }}</span></td>
                <td><span :class="['status-badge', order.fulfillment_status]">{{ order.fulfillment_status || 'unfulfilled' }}</span></td>
                <td>₹{{ order.total_price }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!isLoading && orders.length === 0 && !error" class="no-orders">
          <p>No orders found in the database.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
/* Global Styles */
:root {
  --primary-color: #5a6ac4;
  --primary-hover: #4a5ab4;
  --bg-color: #f4f6f8;
  --text-color: #333;
  --border-color: #e0e0e0;
  --header-bg: #ffffff;
  --table-header-bg: #f9fafb;
  --card-bg: #fff;
  --paid-bg: #e6f4ea;
  --paid-text: #2d8641;
  --unfulfilled-bg: #fff4e5;
  --unfulfilled-text: #e67e22;
  --fulfilled-bg: #e3f2fd;
  --fulfilled-text: #1e88e5;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header */
.app-header {
  background-color: var(--header-bg);
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--primary-color);
}

.sync-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.sync-button:hover {
  background-color: var(--primary-hover);
}

.sync-button:disabled {
  background-color: #9fa8da;
  cursor: not-allowed;
}

/* Main Container */
.container {
  padding: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* Card layout */
.card {
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.card h2 {
  margin-top: 0;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #444;
}

/* Create Order Form */
.create-order-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  align-items: flex-start;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
}
.form-group input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
}
.form-group-submit {
 grid-column: 1 / -1; /* Make button span full width */
}
.create-order-form button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
}
.create-order-form button:disabled {
  background-color: #9fa8da;
  cursor: not-allowed;
}
.form-error {
  margin-top: 1rem;
  grid-column: 1 / -1;
}


/* Messages & Loaders */
.loading, .no-orders {
  text-align: center;
  padding: 3rem;
  color: #777;
}
.error-message, .sync-message {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  text-align: center;
}
.error-message {
  background-color: #ffebee;
  color: #c62828;
}
.sync-message {
  background-color: #e8f5e9;
  color: #2e7d32;
}

/* Table Styles */
.orders-table-container {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}
thead th {
  background-color: var(--table-header-bg);
  font-weight: 600;
  color: #555;
}
tbody tr:last-child td {
  border-bottom: none;
}
tbody tr:hover {
  background-color: #f9f9f9;
}

/* Status Badges */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
}
.status-badge.paid {
  background-color: var(--paid-bg);
  color: var(--paid-text);
}
.status-badge.unfulfilled, .status-badge.null {
  background-color: var(--unfulfilled-bg);
  color: var(--unfulfilled-text);
}
.status-badge.fulfilled {
  background-color: var(--fulfilled-bg);
  color: var(--fulfilled-text);
}
</style>

