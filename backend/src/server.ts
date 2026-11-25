import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import app from './app';
import { connectDB } from './config/db';
import { setupSockets } from './sockets/socketHandler';
import { startReleaseSeatsJob } from './jobs/releaseSeatsJob';


dotenv.config();

const PORT = process.env.PORT || 5000;


const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});


setupSockets(io);
startReleaseSeatsJob(io);


const startServer = async () => {
  await connectDB();
  
  server.listen(PORT, () => {
    console.log(`Serveri (HTTP + WebSockets) po dëgjon në portën ${PORT}`);
  });
};

startServer();
