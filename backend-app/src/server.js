// backend-app/src/server.js

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001; // Use port from .env or default to 3001

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Basic Route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Tracker API!' });
});

// Placeholder for Inventory Routes (to be implemented later)
// const inventoryRoutes = require('./routes/inventoryRoutes');
// app.use('/api/inventory', inventoryRoutes);

// Placeholder for Sales Routes (to be implemented later)
// const salesRoutes = require('./routes/salesRoutes');
// app.use('/api/sales', salesRoutes);

// Global error handler (simple example)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Start the server
async function main() {
  try {
    // Optional: Test database connection (Prisma doesn't require explicit connect for queries)
    // await prisma.$connect(); 
    // console.log("Successfully connected to the database.");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error("Failed to start the server or connect to the database:", e);
    process.exit(1);
  }
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

