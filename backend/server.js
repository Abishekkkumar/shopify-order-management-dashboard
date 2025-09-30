const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables FIRST
dotenv.config();

// Now require the other modules
const connectDB = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Allows us to accept JSON data in the body
app.use(cors()); // Enable Cross-Origin Resource Sharing

// Define Routes
app.use('/api/orders', orderRoutes);

// Define the Port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);
