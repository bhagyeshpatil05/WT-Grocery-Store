/* ============================================================
   FreshMart – server.js
   Node.js + Express Backend
   Handles checkout POST requests, saves to orders.json

   HOW TO RUN:
     npm install express cors
     node server.js
   Then open http://localhost:3000

   Endpoints:
     POST /order   → Save new order, return confirmation
     GET  /orders  → View all saved orders (dev helper)
     *             → 404 handler
   ============================================================ */

// ─── DEPENDENCIES ────────────────────────────────────────────
const express = require('express');  // Web framework
const cors    = require('cors');     // Cross-Origin Resource Sharing
const fs      = require('fs');       // File system (built-in Node module)
const path    = require('path');     // Path utilities (built-in)

// ─── APP SETUP ───────────────────────────────────────────────
const app  = express();
const PORT = 3000;

// Middleware: parse JSON request bodies
app.use(express.json());

// Middleware: parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Middleware: enable CORS for all origins
// (allows the frontend at file:// or localhost:8080 to call this server)
app.use(cors());

// Middleware: serve static files (HTML, CSS, JS) from current folder
app.use(express.static(path.join(__dirname)));

// ─── ORDERS FILE PATH ────────────────────────────────────────
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Initialise orders.json if it doesn't exist yet
if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf8');
    console.log('📁 Created orders.json');
}

// ─── HELPER: READ ORDERS ─────────────────────────────────────
/**
 * readOrders() – Safely reads and parses orders.json.
 * Returns an array of order objects (empty array on error).
 */
function readOrders() {
    try {
        const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        console.error('Error reading orders.json:', err.message);
        return [];
    }
}

// ─── HELPER: WRITE ORDERS ────────────────────────────────────
/**
 * writeOrders(orders) – Writes the orders array back to orders.json.
 * @param {Array} orders - Array of order objects
 * Returns true on success, false on failure.
 */
function writeOrders(orders) {
    try {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error writing orders.json:', err.message);
        return false;
    }
}

// ─── HELPER: VALIDATE ORDER DATA ─────────────────────────────
/**
 * validateOrder(data) – Server-side validation.
 * @param {Object} data - The request body
 * Returns { valid: bool, errors: string[] }
 */
function validateOrder(data) {
    const errors = [];

    if (!data.name || data.name.trim() === '') {
        errors.push('Name is required.');
    }

    // Simple email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email.trim())) {
        errors.push('A valid email address is required.');
    }

    // Phone: exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!data.phone || !phoneRegex.test(data.phone.trim())) {
        errors.push('Phone must be exactly 10 digits.');
    }

    if (!data.address || data.address.trim() === '') {
        errors.push('Delivery address is required.');
    }

    return { valid: errors.length === 0, errors };
}

// ─── ROUTE: POST /order ──────────────────────────────────────
/**
 * Accepts order data from the checkout form,
 * validates it, and appends to orders.json.
 */
app.post('/order', (req, res) => {
    const body = req.body;

    // Server-side validation
    const { valid, errors } = validateOrder(body);
    if (!valid) {
        return res.status(400).json({
            success: false,
            message: errors.join(' ')
        });
    }

    // Generate unique order ID
    const orderId = 'FM' + Date.now() + Math.floor(Math.random() * 900 + 100);

    // Build order record to save
    const order = {
        orderId:   orderId,
        date:      body.date || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        customer: {
            name:    body.name.trim(),
            email:   body.email.trim(),
            phone:   body.phone.trim(),
            address: body.address.trim()
        },
        payment:   body.payment || 'cod',
        cart:      body.cart || {},  // Cart items object
        total:     parseFloat(body.total) || 0
    };

    // Read existing orders, append new one, write back
    const orders = readOrders();
    orders.push(order);
    const saved = writeOrders(orders);

    if (!saved) {
        return res.status(500).json({
            success: false,
            message: 'Failed to save order. Please try again.'
        });
    }

    // Log to console for debugging
    console.log(`✅ New order saved: ${orderId} | ${order.customer.name} | ₹${order.total}`);

    // Send success response back to frontend
    res.status(200).json({
        success: true,
        orderId: orderId,
        message: `Order ${orderId} confirmed and saved to orders.json!`
    });
});

// ─── ROUTE: GET /orders ──────────────────────────────────────
/**
 * Development helper: view all saved orders as JSON in browser.
 * Visit: http://localhost:3000/orders
 */
app.get('/orders', (req, res) => {
    const orders = readOrders();
    res.status(200).json({
        total:  orders.length,
        orders: orders
    });
});

// ─── ROUTE: GET / ─────────────────────────────────────────────
// Serve index.html when visiting the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ─── 404 HANDLER ─────────────────────────────────────────────
/**
 * Catch-all for any unknown routes.
 * Must be defined AFTER all other routes.
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.url}`
    });
});

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────
/**
 * Catches any unhandled errors thrown inside route handlers.
 * The 4-parameter signature (err, req, res, next) is required by Express.
 */
app.use((err, req, res, next) => {
    console.error('Server error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error.'
    });
});

// ─── START SERVER ─────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('');
    console.log('🌿 FreshMart Node.js Server');
    console.log(`🚀 Running at   : http://localhost:${PORT}`);
    console.log(`🛒 Place orders : POST http://localhost:${PORT}/order`);
    console.log(`📋 View orders  : GET  http://localhost:${PORT}/orders`);
    console.log('');
});
