
🎟️ Real-Time Event & Seat Booking System (MEAN Stack)

A real-time event and seat reservation platform built with MongoDB, Express.js, Angular, and Node.js (TypeScript) using Socket.io and QR Code ticketing.

✨ Key Features

• Real-Time Seat Locking: Atomic MongoDB updates (findOneAndUpdate) + Socket.io rooms (event_{id}) prevent double-booking and sync seat statuses (AVAILABLE, LOCKED, BOOKED) live.
• 5-Minute Lock & Auto-Release: Locked seats have a 5-minute countdown timer; a node-cron job automatically releases expired locks every 30 seconds.
• QR Code Tickets & Validation: Generates Base64 QR tickets on checkout and allows one-time check-in validation (isUsed: true).
• Role-Based Auth (JWT): Supports CLIENT (browse, lock, buy tickets) and ORGANIZER (create events with VIP/standard rows, validate tickets).

🛠️ Tech Stack

• Frontend: Angular (Standalone Components, Signals, Guards, Interceptors), TypeScript, Socket.io Client
• Backend: Node.js, Express.js, TypeScript, Socket.io, Node-Cron, JWT, Bcrypt, QRCode
• Database: MongoDB & Mongoose

🚀 Quick Start


1. Backend

cd backend
npm install
Create a .env file in backend/:
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/realtime-tickets
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:4200
Run the server:
npm run dev

2. Frontend

cd frontend
npm install
ng serve
Open http://localhost:4200 in your browser.
