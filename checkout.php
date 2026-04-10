<?php
/* ============================================================
   FreshMart – checkout.php
   PHP Backend: Receives POST order data, validates it,
   saves to orders.txt, and returns a JSON response.

   HOW TO RUN:
   php -S localhost:8080
   Then open http://localhost:8080/index.html
   ============================================================ */

// Always return JSON so JavaScript can parse the response
header('Content-Type: application/json');

// Allow cross-origin requests from the frontend
// (needed when frontend and PHP are on different ports during dev)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Only POST requests are allowed.']);
    exit;
}

// ─── COLLECT & SANITISE INPUT ───────────────────────────────
// htmlspecialchars() prevents XSS attacks by escaping HTML characters
$name    = htmlspecialchars(trim($_POST['name']    ?? ''));
$email   = htmlspecialchars(trim($_POST['email']   ?? ''));
$phone   = htmlspecialchars(trim($_POST['phone']   ?? ''));
$address = htmlspecialchars(trim($_POST['address'] ?? ''));
$payment = htmlspecialchars(trim($_POST['payment'] ?? ''));
$total   = htmlspecialchars(trim($_POST['total']   ?? ''));
$cart    = $_POST['cart']   ?? '[]';   // Cart items as JSON string
$date    = $_POST['date']   ?? date('d-m-Y H:i:s');

// ─── SERVER-SIDE VALIDATION ──────────────────────────────────
// Always validate on the server — never trust only client-side validation
$errors = [];

if (empty($name)) {
    $errors[] = 'Name is required.';
}

// PHP built-in email validator
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}

// Phone: must be exactly 10 digits
if (empty($phone) || !preg_match('/^\d{10}$/', $phone)) {
    $errors[] = 'Phone must be exactly 10 digits.';
}

if (empty($address)) {
    $errors[] = 'Delivery address is required.';
}

// If there are validation errors, return them immediately
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => implode(' ', $errors)
    ]);
    exit;
}

// ─── GENERATE ORDER ID ───────────────────────────────────────
// Simple unique order ID: FM + timestamp + random number
$orderId = 'FM' . time() . rand(100, 999);

// ─── FORMAT ORDER RECORD ─────────────────────────────────────
// Build a human-readable string to save in orders.txt
$orderRecord  = "====================================\n";
$orderRecord .= "ORDER ID : $orderId\n";
$orderRecord .= "DATE     : $date\n";
$orderRecord .= "------------------------------------\n";
$orderRecord .= "NAME     : $name\n";
$orderRecord .= "EMAIL    : $email\n";
$orderRecord .= "PHONE    : $phone\n";
$orderRecord .= "ADDRESS  : $address\n";
$orderRecord .= "PAYMENT  : $payment\n";
$orderRecord .= "------------------------------------\n";
$orderRecord .= "CART ITEMS:\n";

// Decode and list cart items
$cartItems = json_decode($cart, true);
if (is_array($cartItems)) {
    foreach ($cartItems as $id => $item) {
        $itemName    = $item['name']  ?? 'Unknown';
        $itemPrice   = $item['price'] ?? 0;
        $itemQty     = $item['qty']   ?? 1;
        $itemSubtotal = $itemPrice * $itemQty;
        $orderRecord .= "  - $itemName x$itemQty = ₹$itemSubtotal\n";
    }
}

$orderRecord .= "------------------------------------\n";
$orderRecord .= "TOTAL    : ₹$total\n";
$orderRecord .= "====================================\n\n";

// ─── SAVE TO orders.txt ──────────────────────────────────────
// FILE_APPEND adds to the end instead of overwriting the file
$file    = 'orders.txt';
$written = file_put_contents($file, $orderRecord, FILE_APPEND | LOCK_EX);

if ($written === false) {
    // Could not write to file (check folder permissions)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to save order. Check file permissions.'
    ]);
    exit;
}

// ─── SUCCESS RESPONSE ────────────────────────────────────────
echo json_encode([
    'success' => true,
    'orderId' => $orderId,
    'message' => "Order $orderId saved successfully!"
]);
?>
