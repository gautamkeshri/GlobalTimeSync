// Vercel serverless function entry point
const express = require('express');
const { registerRoutes } = require('../dist/routes.js');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register all API routes
registerRoutes(app);

// Export for Vercel
module.exports = app;