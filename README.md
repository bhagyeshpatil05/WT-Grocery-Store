# 🌿 FreshMart – Local Store Inventory & Smart Cart

A complete full-stack mini project built with **HTML, CSS, Bootstrap, JavaScript, PHP, and Node.js**.

---

## 📁 Project Structure

```
local-store-app/
├── index.html       ← Main frontend (Home, Products, Cart, Checkout)
├── style.css        ← External stylesheet (custom design system)
├── script.js        ← JavaScript: cart logic, DOM manipulation, form validation
├── checkout.php     ← PHP backend: validates & saves orders to orders.txt
├── server.js        ← Node.js/Express backend: saves orders to orders.json
├── package.json     ← Node.js dependencies
├── orders.txt       ← PHP order log file
├── orders.json      ← Node.js order storage file
└── README.md        ← This file
```

---

## 🚀 How to Run

### Option A — Frontend Only (GitHub Pages / Direct Open)
Just open `index.html` in your browser.  
The cart, DOM manipulation, and form validation all work without a server.  
Order submission will show a friendly message if the backend isn't running.

### Option B — With PHP Backend
```bash
# From the project folder:
php -S localhost:8080

# Then open:
http://localhost:8080/index.html
```
Orders are saved to `orders.txt`.

### Option C — With Node.js Backend
```bash
# Install dependencies (once):
npm install

# Start the server:
node server.js

# Then open:
http://localhost:3000
```
Orders are saved to `orders.json`.  
View all orders at: `http://localhost:3000/orders`

---

## ✨ Features

| Feature | Details |
|---|---|
| Responsive UI | Bootstrap 5 grid, mobile-first |
| Product Cards | 6 products with emoji illustrations, price, Add to Cart |
| Smart Cart | Add, remove, update qty, live total — no page reload |
| Form Validation | Name, email (regex), phone (10 digits), address |
| PHP Backend | POST handler → saves to `orders.txt` |
| Node.js Backend | Express POST → saves to `orders.json`, 404 handler |
| Toast Notifications | Live feedback on all cart and form actions |

---

## 🧪 Testing Checklist

- [ ] Add products to cart and see badge update
- [ ] Change quantity with +/− buttons
- [ ] Remove items from cart
- [ ] Try submitting checkout form with empty fields
- [ ] Try invalid email and phone formats
- [ ] Submit with PHP server running → check `orders.txt`
- [ ] Submit with Node server running → check `orders.json`

---

## 🌐 GitHub Pages Deployment

Push only these files for a static frontend deployment:
- `index.html`
- `style.css`
- `script.js`

The cart and validation work fully on GitHub Pages.  
Backend features (PHP/Node) require a server environment.

---

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, Bootstrap 5, Vanilla JS
- **PHP**: 8.x (built-in server)
- **Node.js**: 18+ with Express 4, cors
- **Storage**: Flat file (`orders.txt`, `orders.json`)
