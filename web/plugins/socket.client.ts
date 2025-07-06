// Only runs on client-side
import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  const socket = io('http://localhost:8080'); // Update with your backend URL

  // Optional: handle connect
  socket.on('connect', () => {
    console.log('Connected with socket ID:', socket.id);
  });

  // Inject globally
  return {
    provide: {
      socket,
    },
  };
});