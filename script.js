
let cart = {};

window.addEventListener('scroll', function () {
  const nav = document.getElementById('mainNav');
  if (window.scrollY > 50) {
    nav.style.background = 'rgba(26,60,46,0.98)';
  } else {
    nav.style.background = 'rgba(26,60,46,0.95)';
  }
});


/**
 * addToCart(btn) – Called when user clicks "Add" on a product card.
 * Reads data attributes from the button, updates cart state, refreshes UI.
 * @param {HTMLButtonElement} btn 
 */
function addToCart(btn) {
  const id    = btn.dataset.id;
  const name  = btn.dataset.name;
  const price = parseFloat(btn.dataset.price);

  if (cart[id]) {
 
    cart[id].qty++;
  } else {
  
    cart[id] = { name, price, qty: 1 };
  }

  btn.classList.add('added');
  btn.innerHTML = '<i class="bi bi-check2"></i> Added';
  setTimeout(() => {
    btn.classList.remove('added');
    btn.innerHTML = '<i class="bi bi-plus-lg"></i> Add';
  }, 1200);

  renderCart();
  showToast(`🛒 ${name} added to cart!`);
}

function renderCart() {
  const cartItems   = document.getElementById('cartItems');
  const cartEmpty   = document.getElementById('cartEmpty');
  const cartContent = document.getElementById('cartContent');
  const cartBadge   = document.getElementById('cartBadge');

  const ids = Object.keys(cart);

  if (ids.length === 0) {

    cartEmpty.style.display   = 'block';
    cartContent.style.display = 'none';
    cartBadge.textContent     = '0';
    return;
  }

  cartEmpty.style.display   = 'none';
  cartContent.style.display = 'block';

  let totalQty   = 0;
  let totalPrice = 0;
  let rowsHTML   = '';

  ids.forEach(id => {
    const item    = cart[id];
    const subtotal = item.price * item.qty;
    totalQty      += item.qty;
    totalPrice    += subtotal;

    rowsHTML += `
      <tr>
        <td><strong>${item.name}</strong></td>
        <td>
          <div class="qty-controls">
            <!-- Decrease qty -->
            <button class="qty-btn" onclick="changeQty('${id}', -1)">−</button>
            <span class="qty-value">${item.qty}</span>
            <!-- Increase qty -->
            <button class="qty-btn" onclick="changeQty('${id}', 1)">+</button>
          </div>
        </td>
        <td class="text-end">₹${item.price}</td>
        <td class="text-end"><strong>₹${subtotal}</strong></td>
        <td class="text-end">
          <!-- Remove item from cart -->
          <button class="btn-remove" onclick="removeItem('${id}')" title="Remove">
            <i class="bi bi-x-lg"></i>
          </button>
        </td>
      </tr>`;
  });

  cartItems.innerHTML = rowsHTML;

  document.getElementById('cartSubtotal').textContent = `₹${totalPrice}`;
  document.getElementById('cartTotal').textContent    = `₹${totalPrice}`;

  cartBadge.textContent = totalQty;
}

/**
 * changeQty(id, delta) – Increases or decreases item qty.
 * Removes item if qty drops to 0.
 * @param {string} id    - Product ID key in cart
 * @param {number} delta - +1 or -1
 */
function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;

  if (cart[id].qty <= 0) {
    delete cart[id]; // Remove item when qty reaches 0
  }
  renderCart();
}

/**
 * removeItem(id) – Completely removes a product from the cart.
 * @param {string} id - Product ID key in cart
 */
function removeItem(id) {
  if (cart[id]) {
    showToast(`🗑️ ${cart[id].name} removed.`);
    delete cart[id];
    renderCart();
  }
}

function clearCart() {
  if (Object.keys(cart).length === 0) return;
  cart = {};
  renderCart();
  showToast('Cart cleared!');
}

function showCheckout() {
  if (Object.keys(cart).length === 0) {
    showToast('⚠️ Add items to cart first!');
    return;
  }

  let summaryHTML = '<strong>Order Summary:</strong><br/>';
  let total = 0;
  Object.values(cart).forEach(item => {
    const sub = item.price * item.qty;
    total += sub;
    summaryHTML += `${item.name} × ${item.qty} = ₹${sub}<br/>`;
  });
  summaryHTML += `<strong>Total: ₹${total}</strong>`;
  document.getElementById('checkoutSummary').innerHTML = summaryHTML;

  document.getElementById('checkout').style.display    = 'block';
  document.getElementById('checkoutForm').style.display = 'block';
  document.getElementById('orderSuccess').style.display = 'none';

  document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
}

function hideCheckout() {
  document.getElementById('checkout').style.display = 'none';
  document.getElementById('cart').scrollIntoView({ behavior: 'smooth' });
}

function validateForm() {
  let valid = true;

  function setError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);

    if (message) {
      error.textContent = '⚠ ' + message;
      input.classList.add('is-invalid');
      valid = false;
    } else {
      error.textContent = '';
      input.classList.remove('is-invalid');
    }
  }

  const name = document.getElementById('custName').value.trim();
  setError('custName', 'nameError', name ? '' : 'Full name is required.');

  const email     = document.getElementById('custEmail').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple RFC-like pattern
  if (!email) {
    setError('custEmail', 'emailError', 'Email address is required.');
  } else if (!emailRegex.test(email)) {
    setError('custEmail', 'emailError', 'Please enter a valid email (e.g. user@example.com).');
  } else {
    setError('custEmail', 'emailError', '');
  }

  const phone     = document.getElementById('custPhone').value.trim();
  const phoneRegex = /^\d{10}$/; 
  if (!phone) {
    setError('custPhone', 'phoneError', 'Phone number is required.');
  } else if (!phoneRegex.test(phone)) {
    setError('custPhone', 'phoneError', 'Phone must be exactly 10 digits (numbers only).');
  } else {
    setError('custPhone', 'phoneError', '');
  }

  const address = document.getElementById('custAddress').value.trim();
  setError('custAddress', 'addressError', address ? '' : 'Delivery address is required.');

  return valid; // true = all fields passed
}

function getFormData() {
  return {
    name:    document.getElementById('custName').value.trim(),
    email:   document.getElementById('custEmail').value.trim(),
    phone:   document.getElementById('custPhone').value.trim(),
    address: document.getElementById('custAddress').value.trim(),
    payment: document.querySelector('input[name="payment"]:checked').value,
    cart:    cart,
    total:   Object.values(cart).reduce((sum, i) => sum + i.price * i.qty, 0),
    date:    new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  };
}

async function submitPHP() {
  if (!validateForm()) return;

  const data = getFormData();

  const formData = new FormData();
  formData.append('name',    data.name);
  formData.append('email',   data.email);
  formData.append('phone',   data.phone);
  formData.append('address', data.address);
  formData.append('payment', data.payment);
  formData.append('total',   data.total);
  formData.append('cart',    JSON.stringify(data.cart));
  formData.append('date',    data.date);

  try {
    const response = await fetch('checkout.php', {
      method: 'POST',
      body:   formData
    });
    const result = await response.json();

    if (result.success) {
      showSuccess(`Order #${result.orderId} confirmed! Saved via PHP. Check orders.txt.`);
    } else {
      showToast('❌ Server error: ' + result.message);
    }
  } catch (err) {
    showToast('⚠️ PHP server not running. Run: php -S localhost:8080');
    console.error('PHP fetch error:', err);
  }
}

async function submitNode() {
  if (!validateForm()) return;

  const data = getFormData();

  try {
    const response = await fetch('http://localhost:3000/order', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data)
    });
    const result = await response.json();

    if (result.success) {
      showSuccess(`Order #${result.orderId} confirmed! Saved via Node.js. Check orders.json.`);
    } else {
      showToast('❌ Node error: ' + result.message);
    }
  } catch (err) {
    showToast('⚠️ Node server not running. Run: node server.js');
    console.error('Node fetch error:', err);
  }
}

function showSuccess(msg) {
  document.getElementById('checkoutForm').style.display = 'none';
  document.getElementById('orderSuccess').style.display = 'block';
  document.getElementById('successMsg').textContent     = msg;
  document.getElementById('orderSuccess').scrollIntoView({ behavior: 'smooth' });
}

function resetAll() {
  cart = {};
  renderCart();

  document.getElementById('checkoutForm').reset();
  ['nameError','emailError','phoneError','addressError'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
  ['custName','custEmail','custPhone','custAddress'].forEach(id => {
    document.getElementById(id).classList.remove('is-invalid');
  });

  document.getElementById('checkout').style.display     = 'none';
  document.getElementById('orderSuccess').style.display = 'none';
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  showToast('🎉 Thank you! Happy shopping again.');
}

// ─── TOAST NOTIFICATION ──────────────────────────────────────
/**
 * showToast(msg) – Shows a temporary notification at the bottom-right.
 * @param {string} msg - Message to display
 */
function showToast(msg) {
  const toast = document.getElementById('toastMsg');
  toast.textContent = msg;
  toast.classList.add('show');
  // Auto-hide after 2.8 seconds
  setTimeout(() => toast.classList.remove('show'), 2800);
}

document.addEventListener('change', function (e) {
  if (e.target.name === 'payment') {
    document.querySelectorAll('.payment-opt').forEach(el => el.classList.remove('active'));
    e.target.closest('.payment-opt').classList.add('active');
  }
});

renderCart();
