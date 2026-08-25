# Mini E-Commerce & Product Recommendation Platform

A full-stack e-commerce web application featuring personalized product recommendations, cart and order management, and a comprehensive Admin Dashboard.

---

## Project Description

This platform is a modern e-commerce solution designed to deliver a personalized shopping experience. It tracks user interactions (views, cart additions, and purchases) to recommend relevant products dynamically. The system includes full authentication, a shopping cart, checkout and order processing, and a complete administrative management suite for products, categories, orders, and users.

---

## Technologies (Tech Stack)

### Backend
* **Runtime & Framework:** Node.js, Express.js
* **Database & ORM:** MongoDB, Mongoose
* **Authentication:** JSON Web Token (JWT), Bcrypt.js
* **API Architecture:** RESTful API

### Frontend
* **Framework:** Next.js (App Router), React 18+
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Icons:** Lucide React

---

## Key Features

### Customer Features
* **Authentication:** Secure signup, login, and session persistence via JWT.
* **Profile Management:** View and update personal profile details, change password.
* **Product Browsing:** Search, filter, and view products by categories.
* **Cart & Orders:** Add, update, and remove cart items; checkout and track order history.
* **Personalized Recommendations:** Dynamic product recommendations based on user interaction history.

### Admin Features
* **Category Management:** Full CRUD operations for categories.
* **Product Management:** Manage product catalog, pricing, and stock inventory.
* **Order Management:** View all customer orders and update status (`Pending`, `Confirmed`, `Completed`, `Cancelled`).
* **User Management:** View registered accounts and toggle user roles (`0: Customer`, `1: Admin`).

---

## Project Structure

```text
├── backend/
│   ├── config/             # Database connection setup
│   ├── controller/         # Business logic handlers
│   ├── middleware/         # Auth & Admin authorization middlewares
│   ├── models/             # Mongoose schemas (User, Product, Order, Category, Interaction)
│   ├── routes/             # REST API route definitions
│   ├── utils/              # Helper utilities
│   ├── .env.example        # Backend environment template
│   └── server.js           # Express application entry point
│
├── frontend/               # Next.js Application
│   ├── src/
│   │   ├── app/            # App Router pages and admin dashboard
│   │   ├── components/     # Reusable UI components
│   │   └── context/        # React Contexts (CartContext, AuthContext)
│   ├── .env.example  # Frontend environment template
│   └── next.config.ts      # Next.js configuration
│
└── README.md
```

---

## Environment Variables

### 1. Backend (`backend/.env`)
Create a `.env` file inside the `backend/` directory:

```env
PORT=5000

# Database Configuration
# Local MongoDB: mongodb://127.0.0.1:27017/DATN_Ecommerce
# Cloud Mongo: mongodb+srv://<username>:<password>@cluster.mongodb.net/DATN_Ecommerce
MONGODB_URI=mongodb://127.0.0.1:27017/ECommerce

# JWT Authentication Config
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

### 2. Frontend (`frontend/.env`)
Create a `.env` file inside the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/ThanhDuy1qa/Mini-E-Commerce-Product-Recommendation-Platform.git
cd Mini-E-Commerce-Product-Recommendation-Platform
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## Run Frontend / Backend

### Running the Backend

Navigate to the `backend/` directory and execute:

```bash
# Development mode with auto-reload (Nodemon)
npm run dev

# Standard Node execution
npm start
```
The backend server will run at `http://localhost:5000`.

### Running the Frontend

Open a new terminal, navigate to the `frontend/` directory, and execute:

```bash
# Development mode
npm run dev

# Production build and start
npm run build
npm start
```
The frontend application will be accessible at `http://localhost:3000`.
