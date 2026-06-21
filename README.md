# 💬 Real-Time Chat Application

A premium real-time messaging web application featuring Clerk authentication, Socket.io instant messaging, MongoDB storage, and dynamic styling customizability.

---

## ✨ Key Features

- **Real-Time Communication**: Seamless messaging powered by Socket.io, complete with online/offline indicators.
- **Robust User Directory & Search**:
  - Search for users by **email** or **phone number** with an interactive user preview card.
  - Add to contacts and immediately navigate to chats.
- **Secure Clerk Authentication**: Integrated login/signup using Clerk with two synchronization mechanisms:
  - **Clerk Webhooks** for automated production profile creation.
  - **Sign-in Auto-Sync Fallback** using backend SDK (`clerkClient`) to automatically create user records in MongoDB if webhooks are not configured (highly useful for local development).
- **Rich Media Sharing**: Support for uploading images, videos, audio, and document files via ImageKit or local storage backup.
- **Customizable Experience**: Wallpaper selector and preset theme options (supporting light/dark themes).

---

## 🛠️ Technology Stack

| Tier | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Zustand, HeroUI components, Lucide icons |
| **Backend** | Node.js, Express, Socket.io, Clerk Node SDK |
| **Database** | MongoDB (Mongoose) |
| **Storage** | ImageKit (Primary), Local filesystem (Fallback) |

---

## 🚀 Getting Started

### 📋 Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a local running instance
- A [Clerk Account](https://clerk.com/) with configured Publishable and Secret keys

---

### ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ChandranSukirthan/RealTime-ChatApplication.git
   cd RealTime-ChatApplication
   ```

2. **Configure Environment Variables**:
   
   Create a `.env` file inside the `backend` directory:
   ```env
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   MONGODB_URI=your_mongodb_connection_string
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

   Create a `.env` file inside the `frontend` directory:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

3. **Install Dependencies**:
   ```bash
   # From project root
   npm install
   
   # In frontend
   cd frontend && npm install
   
   # In backend
   cd ../backend && npm install
   ```

---

### 💻 Running Locally

To run the application in development mode:

1. **Start the Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend Server**:
   ```bash
   cd frontend
   npm run dev
   ```

Your app will be running at `http://localhost:5173`.

---

## 📱 Contact Search & Chat Flow

1. Navigate to the **Users** tab in the sidebar.
2. Enter an **email** or **phone number** and click **Search**.
3. If a match is found, an animated preview card displays the user profile.
4. Click **Add & Chat** (or **Open Chat** if already a contact) to immediately open the message workspace.
