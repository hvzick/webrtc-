# WebRTC Terminal Messaging

A peer-to-peer terminal-based messaging system using WebRTC and Ethereum wallet addresses as identifiers.

![Terminal Messaging Demo](https://i.imgur.com/example.gif)

## 🌟 Features

- **Terminal-based UI**: Send and receive messages directly in your terminal
- **WebRTC**: Peer-to-peer communication with no central server after connection
- **Ethereum Identity**: Use wallet addresses as unique identifiers
- **Cross-terminal**: Works across different terminals on the same machine
- **Cross-device**: Works between different computers on different networks
- **Simple Interface**: Just type and press Enter to send messages

## 📋 Requirements

- Node.js v14+
- npm or yarn

## 🚀 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/za.i.14/webrtc-terminal-messaging.git
   cd webrtc-terminal-messaging
   2. Install dependencies:
   ```

```shellscript
npm install
```

## 💻 Usage

### 1. Start the signaling server

```shellscript
node signaling-server.js
```

This will start the WebSocket signaling server on port 8080.

### 2. Start the first client

In a new terminal:

```shellscript
node client.js 0x1111111111111111111111111111111111111111
```

Replace the address with any valid Ethereum address format (for testing purposes).

### 3. Start the second client

In another terminal:

```shellscript
node client.js 0x2222222222222222222222222222222222222222
```

### 4. Connect the clients

In one of the client terminals, type:

```plaintext
connect 0x2222222222222222222222222222222222222222
```

Or from the other terminal:

```plaintext
connect 0x1111111111111111111111111111111111111111
```

### 5. Start messaging!

Once connected, simply type your message and press Enter to send. Messages will appear in real-time in the other terminal.

## 🔧 Available Commands

In the client terminal:

- `connect <wallet-address>` - Connect to another user
- `help` - Show available commands
- `clear` - Clear the terminal
- `quit` or `exit` - Exit the application

## 🔍 How It Works

### Architecture

```plaintext
┌─────────────────┐                 ┌─────────────────┐
│                 │                 │                 │
│    Client A     │◄───WebRTC────►│    Client B     │
│                 │                 │                 │
└────────┬────────┘                 └────────┬────────┘
         │                                   │
         │                                   │
         │         ┌─────────────┐           │
         │         │             │           │
         └─────────► Signaling   ◄───────────┘
                   │   Server    │
                   │             │
                   └─────────────┘
```

1. **Signaling Server**: Facilitates the initial connection between clients

1. Handles client registration with wallet addresses
1. Forwards WebRTC offers, answers, and ICE candidates

1. **WebRTC Connection**: Establishes direct peer-to-peer connection

1. Uses STUN servers for NAT traversal
1. Creates data channels for messaging

1. **Message Flow**:

1. Messages are sent directly between peers
1. No server involvement after connection is established
1. Terminal interface captures input and displays messages

## 🔒 Security Considerations

- This is a basic implementation for demonstration purposes
- No encryption is implemented in this version
- Wallet addresses are used as identifiers only, no actual blockchain integration

## 🛠️ Future Improvements

- End-to-end encryption for messages
- Actual wallet integration for authentication
- Message history and persistence
- Group messaging support
- File transfer capabilities
- Better error handling and reconnection logic

## 📄 License

MIT License

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit your Changes (`git commit -m 'Add some amazing feature'`)
4. Push to the Branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

```plaintext

This README provides a comprehensive guide to your WebRTC Terminal Messaging project. It includes all the necessary information for users to understand, install, and use your application. The structure is clean and follows GitHub best practices with emojis for better readability and section organization.

You can customize it further by:
1. Adding an actual screenshot or GIF demonstration
2. Including your actual GitHub username
3. Adding any specific implementation details you want to highlight
4. Expanding the technical explanation if needed

Would you like me to make any adjustments to the RE
```
