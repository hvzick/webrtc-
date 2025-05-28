import WebSocket from 'ws';
import wrtc from 'wrtc';
import readline from 'readline';

const SIGNALING_SERVER = 'wss://webrtc-signalling2.onrender.com';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
    username: 'webrtc',
    credential: 'webrtc'
  }
];

class TerminalMessenger {
  constructor(walletAddress) {
    this.walletAddress = walletAddress;
    this.ws = null;
    this.peerConnection = null;
    this.dataChannel = null;
    this.targetWallet = null;
    this.connected = false;

    this.setupTerminal();
    this.connectToServer();
  }

  setupTerminal() {
    console.clear();
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    WebRTC Terminal Messenger                 ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`🔐 Your Wallet: ${this.walletAddress}`);
    console.log('');

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> '
    });

    this.showCommands();
    this.rl.prompt();

    this.rl.on('line', (input) => {
      this.handleTerminalInput(input.trim());
    });
  }

  showCommands() {
    console.log('📝 Available Commands:');
    console.log('   connect <wallet-address>  - Connect to another user');
    console.log('   help                      - Show this help');
    console.log('   clear                     - Clear terminal');
    console.log('   quit                      - Exit');
    console.log('');
    if (this.connected) {
      console.log('💬 Connected! Just type your message and press Enter to send.');
    } else {
      console.log('💡 Start by connecting to another wallet address.');
    }
    console.log('─'.repeat(60));
  }

  handleTerminalInput(input) {
    if (input === '') {
      this.rl.prompt();
      return;
    }

    if (input === 'quit' || input === 'exit') {
      console.log('\n👋 Goodbye!');
      this.cleanup();
      process.exit(0);
    }

    if (input === 'help') {
      this.showCommands();
      this.rl.prompt();
      return;
    }

    if (input === 'clear') {
      console.clear();
      this.showCommands();
      this.rl.prompt();
      return;
    }

    if (input.startsWith('connect ')) {
      const targetWallet = input.substring(8).trim();
      if (targetWallet) {
        this.initiateConnection(targetWallet);
      } else {
        console.log('❌ Please provide a wallet address');
      }
      this.rl.prompt();
      return;
    }

    if (this.connected && this.dataChannel && this.dataChannel.readyState === 'open') {
      this.sendMessage(input);
    } else {
      console.log('❌ Not connected. Use: connect <wallet-address>');
    }

    this.rl.prompt();
  }

  connectToServer() {
    console.log('🔌 Connecting to signaling server...');
    this.ws = new WebSocket(SIGNALING_SERVER);

    this.ws.on('open', () => {
      console.log('✅ Connected to signaling server');
      this.ws.send(JSON.stringify({
        type: 'register',
        walletAddress: this.walletAddress
      }));
    });

    this.ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      this.handleSignalingMessage(message);
    });

    this.ws.on('error', (error) => {
      console.error('🚨 Server connection error:', error.message);
    });

    this.ws.on('close', () => {
      console.error('🔌 WebSocket disconnected. Try restarting the app.');
    });
  }

  async initiateConnection(targetWallet) {
    this.targetWallet = targetWallet;
    console.log(`🤝 Connecting to ${targetWallet}...`);

    this.peerConnection = new wrtc.RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.setupPeerConnection();

    this.dataChannel = this.peerConnection.createDataChannel('chat');
    this.setupDataChannel();

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.ws.send(JSON.stringify({
      type: 'offer',
      from: this.walletAddress,
      to: targetWallet,
      offer: offer
    }));
  }

  setupPeerConnection() {
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.ws.send(JSON.stringify({
          type: 'ice-candidate',
          from: this.walletAddress,
          to: this.targetWallet,
          candidate: event.candidate
        }));
      }
    };

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      if (state === 'connected') {
        this.connected = true;
        console.log('🎉 WebRTC connection established!');
        console.log('💬 You can now type messages directly in the terminal');
        console.log('─'.repeat(60));
      } else if (state === 'disconnected' || state === 'failed') {
        this.connected = false;
        console.log('❌ Connection lost');
      }
    };
  }

  setupDataChannel() {
    this.dataChannel.onopen = () => {
      console.log('📡 Chat channel ready');
    };

    this.dataChannel.onmessage = (event) => {
      process.stdout.write('\r\x1b[K');
      console.log(`📨 ${this.getShortWallet(this.targetWallet)}: ${event.data}`);
      this.rl.prompt();
    };

    this.dataChannel.onclose = () => {
      this.connected = false;
      console.log('📡 Chat channel closed');
    };
  }

  async handleSignalingMessage(message) {
    switch (message.type) {
      case 'registered':
        console.log(`✅ Registered as ${this.getShortWallet(message.walletAddress)}`);
        console.log('🎯 Ready to connect to other wallets');
        break;

      case 'offer':
        console.log(`📞 Incoming connection from ${this.getShortWallet(message.from)}`);
        this.targetWallet = message.from;

        this.peerConnection = new wrtc.RTCPeerConnection({ iceServers: ICE_SERVERS });
        this.setupPeerConnection();

        await this.peerConnection.setRemoteDescription(message.offer);
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        this.ws.send(JSON.stringify({
          type: 'answer',
          from: this.walletAddress,
          to: message.from,
          answer: answer
        }));
        break;

      case 'answer':
        await this.peerConnection.setRemoteDescription(message.answer);
        break;

      case 'ice-candidate':
        await this.peerConnection.addIceCandidate(message.candidate);
        break;

      case 'error':
        console.log(`❌ ${message.message}`);
        break;
    }
  }

  sendMessage(text) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(text);
      console.log(`📤 You: ${text}`);
    }
  }

  getShortWallet(wallet) {
    return `${wallet.substring(0, 6)}...${wallet.substring(38)}`;
  }

  cleanup() {
    if (this.dataChannel) this.dataChannel.close();
    if (this.peerConnection) this.peerConnection.close();
    if (this.ws) this.ws.close();
    if (this.rl) this.rl.close();
  }
}

const wallet = process.argv[2];
if (!wallet) {
  console.log('Usage: node client.js <wallet-address>');
  console.log('Example: node client.js 0x1111111111111111111111111111111111111111');
  process.exit(1);
}

new TerminalMessenger(wallet);

process.on('SIGINT', () => {
  console.log('\n👋 Exiting...');
  process.exit(0);
});
