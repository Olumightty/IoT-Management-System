import { io } from 'socket.io-client';


const socket = io('http://localhost:5000', {
  auth: { token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5OTlmNmQ2Yi01MjE2LTQ5MmUtYjc1ZS0wNzgxNmExOGE4ZWQiLCJyb2xlIjoiZW5naW5lZXIiLCJpYXQiOjE3NjY4NzQwODYsImV4cCI6MTc2ODA4MzY4Nn0.vxDHF78BpdOuGtcFXa67Mo66C9XivMCOcP75MHWBTWk` },
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('connected');
  socket.emit('query_metrics', {
    deviceId: '89bbb3f3-41b9-4ff1-8367-4929feef65d5',
    appliance: 'fan_1',
    from: Date.now() - 3600 * 1000,
    to: Date.now(),
  });
});

socket.on('metrics_response', (msg) => {
  console.log('received', msg);
});

socket.on('liveTelemetry', (msg) => {
  console.log('received', msg);
});

socket.on('disconnect', (r) => {
  console.log('disconnected:', r);
});
