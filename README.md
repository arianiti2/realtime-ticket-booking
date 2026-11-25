# 🎟️ Real-Time Event & Seat Booking System (MEAN Stack)

A real-time event and seat reservation platform built with **MongoDB, Express.js, Angular, and Node.js (TypeScript)** using **Socket.io** and **QR Code** ticketing.

---

## ✨ Key Features

* **Real-Time Seat Locking:** Atomic MongoDB updates (`findOneAndUpdate`) + Socket.io rooms (`event_{id}`) prevent double-booking and sync seat statuses (`AVAILABLE`, `LOCKED`, `BOOKED`) live.
* **5-Minute Lock & Auto-Release:** Locked seats have a 5-minute countdown timer; a `node-cron` job automatically releases expired locks every 30 seconds.
* **QR Code Tickets & Validation:** Generates Base64 QR tickets on checkout and allows one-time check-in validation (`isUsed: true`).
* **Role-Based Auth (JWT):** Supports `CLIENT` (browse, lock, buy tickets) and `ORGANIZER` (create events with VIP/standard rows, validate tickets).

---

## 📸 Screenshots

### 1. Real-Time Seat Selection & Countdown Timer
*Interactive seating map with live Socket.io status updates (`E lirë`, `E bllokuar nga ti`, `E bllokuar tjetëri`, `E rezervuar`) and a 5-minute reservation countdown.*
<img width="944" height="452" alt="Konfirmimi" src="https://github.com/user-attachments/assets/b1be9e97-447a-469b-985b-116e454a2478" />


### 2. Digital QR Code Ticket
*Generated Base64 QR code pass displaying seat details, event venue, date, and unique Ticket ID for check-in validation.*
<img width="554" height="389" alt="Biletat" src="https://github.com/user-attachments/assets/b33868f2-1a52-4c26-9544-5b4a597e8af9" />


### 3. Organizer Dashboard — Create New Event
*Organizer form to configure event details, custom row/seat grid dimensions, VIP rows, and tiered ticket pricing.*
<img width="546" height="452" alt="KrijimiEventit" src="https://github.com/user-attachments/assets/5505b974-f6da-4b94-8326-902781df9def" />


### 4. Role-Based Authentication (Client & Organizer)
*JWT authentication flow supporting role selection during registration.*

| Register | Login |
| :---: | :---: |
<img width="563" height="392" alt="Kycu" src="https://github.com/user-attachments/assets/eabe2677-26f3-40ee-923a-39eba2a301a7" />
<img width="575" height="388" alt="Hyr" src="https://github.com/user-attachments/assets/42eca6ac-a4ed-4817-888d-bb01d6337dff" />


---

## 🛠️ Tech Stack

* **Frontend:** Angular (Standalone Components, Signals, Guards, Interceptors), TypeScript, Socket.io Client
* **Backend:** Node.js, Express.js, TypeScript, Socket.io, Node-Cron, JWT, Bcrypt, QRCode
* **Database:** MongoDB & Mongoose

---

## 🚀 Quick Start

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/realtime-tickets
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:4200
```

Run the server:

```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
ng serve
```

Open `http://localhost:4200` in your browser.
