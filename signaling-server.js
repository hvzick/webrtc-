import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const PORT = 8080;
const server = createServer();
const wss = new WebSocketServer({ server });

// Store connected clients with their wallet addresses
const clients = new Map();

console.log(`🚀 WebRTC Signaling Server starting on port ${PORT}...`);

wss.on('connection', (ws) => {
  console.log('📱 New client connected');
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 Received message:', message.type, 'from:', message.from);
      
      switch (message.type) {
        case 'register':
          // Register client with wallet address
          clients.set(message.walletAddress, ws);
          ws.walletAddress = message.walletAddress;
          console.log(`✅ Client registered with wallet: ${message.walletAddress}`);
          console.log(`👥 Total connected clients: ${clients.size}`);
          
          // Send confirmation
          ws.send(JSON.stringify({
            type: 'registered',
            walletAddress: message.walletAddress
          }));
          break;
          
        case 'offer':
        case 'answer':
        case 'ice-candidate':
          // Forward WebRTC signaling messages to target client
          const targetClient = clients.get(message.to);
          if (targetClient && targetClient.readyState === 1) {
            targetClient.send(JSON.stringify(message));
            console.log(`🔄 Forwarded ${message.type} from ${message.from} to ${message.to}`);
          } else {
            console.log(`❌ Target client ${message.to} not found or disconnected`);
            ws.send(JSON.stringify({
              type: 'error',
              message: `Client ${message.to} not available`
            }));
          }
          break;
          
        default:
          console.log('❓ Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('💥 Error parsing message:', error);
    }
  });
  
  ws.on('close', () => {
    if (ws.walletAddress) {
      clients.delete(ws.walletAddress);
      console.log(`👋 Client ${ws.walletAddress} disconnected`);
      console.log(`👥 Total connected clients: ${clients.size}`);
    }
  });
  
  ws.on('error', (error) => {
    console.error('🚨 WebSocket error:', error);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Signaling server running on ws://localhost:${PORT}`);
  console.log('📋 Ready for client connections...');
});