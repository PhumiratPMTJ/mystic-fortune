import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Serve static files in production from 'dist'
app.use(express.static(path.join(__dirname, 'dist')));

// Keep track of rooms and their states
// rooms structure: {
//   [roomCode]: {
//     hostId: socket.id,
//     players: [ { id: socket.id, name: 'PlayerName', active: true } ],
//     gameState: {}
//   }
// }
const rooms = {};

// Helper to generate a random 4-character uppercase code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars like I, O, 0, 1
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms[code]); // Ensure uniqueness
  return code;
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Host creates a room
  socket.on('create-room', (callback) => {
    const roomCode = generateRoomCode();
    rooms[roomCode] = {
      hostId: socket.id,
      players: [],
      gameState: { status: 'lobby' }
    };
    socket.join(roomCode);
    console.log(`Room created: ${roomCode} by host: ${socket.id}`);
    if (typeof callback === 'function') {
      callback({ success: true, roomCode });
    }
  });

  // 2. Player joins a room
  socket.on('join-room', ({ roomCode, playerName }, callback) => {
    const code = roomCode?.trim().toUpperCase();
    const room = rooms[code];

    if (!room) {
      if (typeof callback === 'function') callback({ success: false, message: 'ไม่พบรหัสห้องนี้!' });
      return;
    }

    if (room.players.length >= 8) {
      if (typeof callback === 'function') callback({ success: false, message: 'ห้องเต็มแล้ว! (รับได้สูงสุด 8 คน)' });
      return;
    }

    // Check if player name already taken in room
    const nameExists = room.players.some(p => p.name.toLowerCase() === playerName.trim().toLowerCase());
    if (nameExists) {
      if (typeof callback === 'function') callback({ success: false, message: 'ชื่อนี้มีคนใช้ไปแล้วในห้อง!' });
      return;
    }

    const newPlayer = {
      id: socket.id,
      name: playerName.trim(),
      active: true
    };

    room.players.push(newPlayer);
    socket.join(code);

    console.log(`Player ${newPlayer.name} (${socket.id}) joined Room ${code}`);

    if (typeof callback === 'function') {
      callback({
        success: true,
        roomCode: code,
        players: room.players.map(p => ({ name: p.name, id: p.id }))
      });
    }

    // Notify Host and all clients in the room about the updated player list
    io.to(code).emit('player-update', room.players.map(p => ({ name: p.name, id: p.id })));
  });

  // 3. Client action (Player triggers something, send to room/host)
  socket.on('client-action', ({ roomCode, action, data }) => {
    const code = roomCode?.trim().toUpperCase();
    const room = rooms[code];
    if (room) {
      // Forward the action to the host or all in room
      io.to(code).emit('room-action', { senderId: socket.id, action, data });
    }
  });

  // 4. Host update (Host changes game state or triggers events)
  socket.on('host-update', ({ roomCode, event, data }) => {
    const code = roomCode?.trim().toUpperCase();
    const room = rooms[code];
    if (room && room.hostId === socket.id) {
      room.gameState = { ...room.gameState, ...data };
      // Broadcast update to everyone in room
      io.to(code).emit('game-update', { event, data });
    }
  });

  // 5. Handle Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    // Check if disconnected user was a host or a player in any room
    for (const code in rooms) {
      const room = rooms[code];

      if (room.hostId === socket.id) {
        // Host disconnected -> Close room
        console.log(`Host disconnected. Closing room: ${code}`);
        io.to(code).emit('room-closed', { message: 'ผู้สร้างห้องออกจากระบบแล้ว' });
        delete rooms[code];
      } else {
        // Player disconnected -> Remove from player list
        const initialLength = room.players.length;
        room.players = room.players.filter(p => p.id !== socket.id);

        if (room.players.length !== initialLength) {
          console.log(`Player removed from room ${code}. Remaining: ${room.players.length}`);
          io.to(code).emit('player-update', room.players.map(p => ({ name: p.name, id: p.id })));
        }
      }
    }
  });
});

// For wildcard route in production, fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
