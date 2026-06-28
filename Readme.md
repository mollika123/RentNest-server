# 🚀 Better-Auth & MongoDB Backend API

This is the backend server for our application, built with **Node.js**, **Express**, **MongoDB**, and secured using **Better-Auth**. It handles authentication (Email/Password & Google OAuth), session management, and database operations in a serverless environment like Vercel.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js (or Next.js API Routes)
- **Database:** MongoDB (via official MongoDB Driver)
- **Authentication:** Better-Auth (with JWT plugin support)
- **Hosting/Deployment:** Vercel

---

## 📁 Project Structure

```text
├── api/
│   └── index.js       # Main server and entry point (Vercel Serverless Function)
├── config/
│   └── auth.js        # Better-Auth and MongoDB connection configuration
├── package.json       # Project dependencies and scripts
└── vercel.json        # Vercel deployment configuration