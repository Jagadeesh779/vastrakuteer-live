# Vastra Kuteer 🌸

Vastra Kuteer is a full-stack E-Commerce application designed to provide a premium shopping experience for Indian ethnic wear. It features a modern user interface, robust administrative dashboards, secure payments, and an automated promotional email engine.

---

## 🚀 Features

### **1. Beautiful & Responsive UI**
- **Frontend Stack**: Built with React, Vite, and Tailwind CSS.
- **Dynamic Assets**: Utilizes Lucide Icons and Recharts for interactive administrative analytics.
- **Custom Typography**: Premium fonts for an authentic fashion-brand aesthetic. 

### **2. E-Commerce Core**
- **Product Management**: Full CRUD operations for categories, sizes, colors, and products.
- **Cart & Checkout**: Complete shopping cart functionality with seamless order flow.
- **Payment Gateway**: Integrated with Razorpay for secure and trusted live transaction processing.
- **Image Hosting**: Automated image resizing and cloud storage using Cloudinary + Multer.

### **3. Authentication & Security**
- **User Authentication**: Secure JWT-based registration and login system with Bcrypt password hashing.
- **Google OAuth**: Fast login and registration handled securely via `@react-oauth/google`.
- **Role-Based Access**: Segregated flows for general Customers and Admin/Manager roles.

### **4. Automated Marketing Engine**
- **Cron Jobs**: Scheduled event marketing via `node-cron`.
- **Live Automated Emails**: Triggers "Flash Sale" and personalized promotional emails using `nodemailer`.
- **Event Calendar**: Real-time integration to remind users of upcoming sales (e.g., Akshaya Tritiya, Diwali).

---

## 🛠️ Tech Stack

| **Area** | **Technologies Used** |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, React Router, Recharts, Lucide React, Axios |
| **Backend** | Node.js, Express.js, JWT, Nodemailer, Razorpay, Node-Cron |
| **Database** | MongoDB (Mongoose Schema Modeling) |
| **Cloud/Storage** | Cloudinary |

---

## 🏗️ Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB instance (Local or Atlas)
- Cloudinary Account
- Razorpay Account (Test Mode)

### 1. Clone the Repository
```bash
git clone https://github.com/Jagadeesh779/vastrakuteer-live.git
cd Vastra-Kuteer-main
```

### 2. Setup the Server (Backend)
```bash
cd server
npm install
```
Create a `.env` file in the `/server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_USER=your_smtp_email
EMAIL_PASS=your_smtp_password
```

### 3. Setup the Client (Frontend)
```bash
cd ../client
npm install
```

### 4. Run the Application
Open two separate terminal tabs:

**Tab 1: Backend**
```bash
cd server
npm run dev
```
**Tab 2: Frontend**
```bash
cd client
npm run dev
```
The app will be running at `http://localhost:5173`.

---

## 📂 Project Structure

```
Vastra-Kuteer-main/
│
├── client/                 # React Frontend Architecture
│   ├── public/             # Static Assets & Icons
│   ├── src/
│   │   ├── components/     # Reusable UI elements (Buttons, Navbars, Cards)
│   │   ├── pages/          # Full page views (Home, Cart, Login, Admin Dashboard)
│   │   └── App.jsx         # Main App Routing entry point
│   ├── vite.config.js      # Vite Configuration
│   └── tailwind.config.js  # Custom Theme and Styling Tokens
│
└── server/                 # RESTful APIs & Data Models
    ├── models/             # Mongoose schemas (User, Product, Order)
    ├── routes/             # Authentication, Product listings, Payments
    ├── middleware/         # Auth verification and Admin role checks
    ├── utils/              # Email templates, Db helpers, cron scripts
    └── server.js           # Server application configuration
```

---

## 🤝 Contribution Requirements

If you'd like to contribute, please follow these rules:
1. Make sure to check/update MongoDB schema dependencies manually if altering `User` or `Product` APIs.
2. Ensure you have tested Razorpay webhook flows locally using `ngrok` before pushing code.
3. Keep the "Orange + Violet" brand theme uniform in UI edits.

## 📝 License
Vastra Kuteer © 2024-2026. All rights reserved.
