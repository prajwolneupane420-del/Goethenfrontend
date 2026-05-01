# E-Commerce Application

A very detailed, production-ready full-stack E-Commerce ecosystem built using the MERN stack (MongoDB, Express, React, Node.js) and Vite. This project combines a feature-rich customer-facing `frontend`, an advanced management `admin` dashboard, and a secure `backend` API to handle all operations smoothly.

## 🚀 Features

### Customer Frontend
* **Product Catalog & Browsing**: Highly interactive UI to view products and details.
* **Shopping Cart System**: Context-based cart with size selection. Includes coupon code discounts validation.
* **User Authentication**: Secure OTP-based registration and password resetting.
* **Checkout Flow**: Support for Cash on Delivery (COD) and Razorpay integration for prepaid orders. Auto-saving user address records.
* **Order History**: Viewing personal order statuses ("Processing", "Shipped", "Delivered", etc.), item sizes, amounts, statuses. 

### Admin Dashboard (Command Center)
* **Real-time Stats**: Track global user count, sales, and total order revenue.
* **Product Manager**: Create, edit, and delete products, handle their image lists, variations, and mock reviews.
* **Coupon Manager**: Set minimum order values, fixed/percentage discounts, and coupon code string identifiers.
* **Banner Manager**: Handle UI heroes and promotions dynamically.
* **Live Order Stream**: Advanced order management system in a data-table.
  * Real-time viewing of processing, shipped, and delivered orders.
  * Toggle between different order statuses using filters.
  * Action items to mark orders as shipped, delivered, or cancelled directly from UI.
  * Extensively detailed records including `Customer Name`, `Shipping Address`, `Size`, `SKUID`.
  * **Excel CSV Export Engine** for administrative logging.

### Backend Infrastructure
* **Robust API Routes**: Rate-limited, Cross-Origin Resource Sharing enabled, and securely encapsulated.
* **Payment Validation Verification**: Utilizing Hmac SHA256 crypto validation for secure payment handshakes.
* **Database Models**: Mongoose models ensuring schema validation prior to NoSQL (MongoDB) operations.

---

## 📁 Directory Structure

```text
/                      # Root Workspace
├── admin/             # React (Vite) Single Page Application for Admin Command Center
│   ├── src/
│   │   ├── components/# Reusable UI fragments (Loaders, Navigations, etc)
│   │   ├── context/   # Context Providers for Admin State
│   │   └── pages/     # Views: Dashboard.jsx, ProductManager.jsx, CouponManager.jsx etc.
├── frontend/          # React (Vite) Single Page Application for Customer Storefront
│   ├── src/
│   │   ├── components/# Frontend pieces (Navbar, Product Cards)
│   │   ├── context/   # CartContext, AuthContext for state management
│   │   └── pages/     # Views: CartPage.jsx, CheckoutPage.jsx, ProfilePage.jsx
├── backend/           # Express Server & REST API
│   └── src/
│       ├── config/    # MongoDB database connection configuration
│       ├── controllers/# Core API logic (auth, product, orders, razorpay logic)
│       ├── models/    # Mongoose NoSQL Schemas (User, Order, Product, Coupon)
│       ├── routes/    # Express routing definitions (GET/POST/PUT/DELETE map)
│       └── server.ts  # Initialization script for middleware setups & express instances
├── server.ts          # Main Production Entrypoint script bringing Backend & Vite SPAs together
├── package.json       # Monolith dependencies & initialization scripts
└── tsconfig.json      # Rules for TypeScript handling across the backend module
```

---

## ⚙️ Core Logic Deep Dive

### 📱 1. OTP Verification System 
Where to find it: `backend/src/controllers/authController.ts` -> `sendOTP()` & `verifyOTP()`

**Logic Flow**:
1. When a user requests an OTP on the frontend, the API invokes the `sendOTP` endpoint.
2. The Backend generates a 6-digit random code and establishes an `otpExpires` expiration limit of 10 minutes. 
3. A `User` record is tentatively upserted into the MongoDB database with just their Phone number and OTP metrics attached.
4. *Important Note*: Instead of integrating expensive SMS SaaS in the preview environment, the OTP is console logged by the server (`[AUTH] OTP for X: Y`) and `123456` functions as a permanent universal master OTP to bypass verification for developmental testing.
5. On the `verifyOTP` stage, it compares the user input against the hash inside MongoDB and checks `Date.now() < otpExpires`.

### 💳 2. Razorpay Payment Gateway
Where to find it: `backend/src/controllers/orderController.ts` -> `createRazorpayOrder()` & `verifyPayment()`

**Logic Flow**:
1. If the selected method is 'prepaid', completing checkout invokes `createRazorpayOrder`.
2. The Node instance validates your `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` environmental constants.
3. An `amount` is calculated (converting your total dynamically to *paise/cents*) and sent to Razorpay servers, returning an official `rzpOrder.id`.
4. Our `Order` module instantiates a document initialized dynamically as `"paymentStatus: 'pending'"`.
5. Frontend launches a Razorpay window script overlay. On completion, Razorpay returns a `razorpay_signature`.
6. The frontend hits `verifyPayment()`. The node backend hashes your Order ID and Payment ID alongside your `RAZORPAY_KEY_SECRET` via `crypto.createHmac("sha256")`. 
7. If the created hex digests precisely match the provided `razorpay_signature`, the database document flips to `"paymentStatus: 'paid'"`.

---

## 🛠 Setup & Installation

### Prerequisites
Make sure you have `Node.js` installed along with an active `MongoDB` cluster database connection string. You'll also optionally need `Razorpay` keys if utilizing prepaid services.

### Environment Variables
Duplicate `.env.example` to `.env` or create a new `.env` file at the root. Include the following variables:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster...
JWT_SECRET=your_super_secret_jwt_signature_key
RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
DASHBOARD_PASSWORD=password123 # (String required for logging into /admin path route)
```

### Start Local Development Server
From the root path, simply run:
```bash
npm install
npm run dev
```
This single start script spins up the server dynamically. The Node.js instance (wrapped natively in `tsx`) serves the backend routes and spins up Vite middleware simultaneously. Your services will run live on `http://localhost:3000`.

---

## 🚀 Deployment (Production Layer)

This program was organized logically so it could easily be hosted inside standard containerized environments like `Cloud Run`, `Render`, `Railway`, or standard VPS machines.

1. Install project dependencies as usual.
2. Build the Vite production assets to their physical distribution format via the built-in system command:
   ```bash
   npm run build
   ```
   *This compiles the react components, CSS, and TS inside both `frontend` and `admin` into the native `dist` folder alongside minified versions.*
3. Expose your environmental secrets securely within your hosting provider interface.
4. Launch the environment via the start command:
   ```bash
   npm run start
   ```
   *Under production conditions via Node (`NODE_ENV=production`), the backend ignores Vite's hot-module development plugins and natively serves index.html and its minified statically generated UI payloads recursively using express.*
