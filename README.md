Shopify Order Management Dashboard
A full-stack web application built with Vue.js, Node.js, Express, and MongoDB to interact with the Shopify Admin API. This dashboard allows users to sync, view, and create Shopify orders through a clean, user-friendly interface.

This project demonstrates a practical integration with a major third-party API, showcasing the ability to handle data synchronization, secure authentication, and full-stack communication.

Features
Order Synchronization: Pulls all orders from a Shopify store and saves them to a local MongoDB database.

Order Display: Displays synced orders in a clean, sorted, and easy-to-read table.

Create Orders: A dedicated form to create new orders directly in Shopify via the backend.

Responsive UI: A simple and clean user interface that is easy to navigate.

Tech Stack
Backend
Node.js: JavaScript runtime environment.

Express.js: Web framework for creating the API.

MongoDB: NoSQL database for storing order data.

Mongoose: ODM for modeling and interacting with MongoDB.

Axios: For making HTTP requests to the Shopify API.

dotenv: For managing environment variables and secret keys.

Frontend
Vue.js (v3): Progressive JavaScript framework for the user interface.

Vite: Modern frontend build tool.

Axios: For making API requests from the frontend to the backend.