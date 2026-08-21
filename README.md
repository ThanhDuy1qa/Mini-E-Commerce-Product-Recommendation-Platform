# Mini E-Commerce & Product Recommendation Platform

A full-stack e-commerce web application featuring personalized product recommendations, cart and order management, and a comprehensive Admin Dashboard.

---

## Tech Stack

### **Backend**
* **Language & Runtime:** Node.js, Express.js
* **Database:** MongoDB (Mongoose ORM)
* **Authentication:** JSON Web Token (JWT) & Bcrypt
* **API Architecture:** RESTful API

### **Frontend**
* **Framework:** Next.js (App Router), React 18+
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Icons & Components:** Lucide React

---

## Key Features

### Customer Features
* **Authentication:** Secure signup, login, and session persistence via JWT.
* **Profile Management:** View and update personal profile details, change password.
* **Product Browsing:** Search, filter, and view products by categories.
* **Cart & Orders:** Add/update/remove cart items, checkout, and track personal order history.
* **Personalized Recommendations:** View tailored product recommendations based on integrated algorithms.

### Admin Features
* **Category Management:** Full CRUD operations for categories (Name, Description).
* **Product Management:** Manage product inventory and specifications.
* **Order Management:** View all system orders and update status (`Pending`, `Shipping`, `Completed`, `Cancelled`).
* **User Management:** View all accounts and toggle user roles (`0: Customer`, `1: Admin`).

---

## Project Structure

```text
├── backend/
│   ├── config/             # Database connection settings
│   ├── controller/         # Business logic handlers
│   ├── middleware/         # Auth & Admin authorization middlewares
│   ├── models/             # Mongoose schemas (User, Product, Order, Category, etc.)
│   ├── routes/             # API route definitions
│   ├── utils/
│   ├── .env.example        # Sample backend environment variables
│   └── server.js           # Express app entry point
│
├── frontend/               # Next.js Application
│   ├── src/
│   │   ├── app/            # App Router (Pages, Admin dashboard routes)
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Contexts (CartContext, AuthContext)
│   └── .env.local.example  # Sample frontend environment variables
│
└── README.md
