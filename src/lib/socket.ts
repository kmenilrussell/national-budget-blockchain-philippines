import { Server } from 'socket.io';

interface BlockData {
  height: number;
  hash: string;
  prevHash: string;
  merkleRoot: string;
  timestamp: string;
  proposer: string;
  proposerName: string;
  transactionCount: number;
  size: number;
}

interface TransactionData {
  id: string;
  txId: string;
  type: 'ISSUE' | 'TRANSFER' | 'SPEND';
  sender: string;
  senderName: string;
  recipient: string;
  recipientName: string;
  amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  timestamp: string;
  blockHeight?: number;
}

interface ValidatorUpdate {
  validatorId: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastBlockHeight?: number;
  reputation?: number;
}

export const setupSocket = (io: Server) => {
  // Store connected clients
  const connectedClients = new Set<string>();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    connectedClients.add(socket.id);

    // Join blockchain room for real-time updates
    socket.join('blockchain');
    
    // Handle new block events
    socket.on('new_block', (blockData: BlockData) => {
      console.log('New block received:', blockData.height);
      // Broadcast to all clients in blockchain room
      io.to('blockchain').emit('block_created', {
        ...blockData,
        timestamp: new Date().toISOString()
      });
    });

    // Handle new transaction events
    socket.on('new_transaction', (txData: TransactionData) => {
      console.log('New transaction received:', txData.txId);
      // Broadcast to all clients in blockchain room
      io.to('blockchain').emit('transaction_created', {
        ...txData,
        timestamp: new Date().toISOString()
      });
    });

    // Handle transaction status updates
    socket.on('transaction_update', (data: { txId: string; status: 'PENDING' | 'CONFIRMED' | 'REJECTED'; blockHeight?: number }) => {
      console.log('Transaction updated:', data.txId, data.status);
      // Broadcast to all clients in blockchain room
      io.to('blockchain').emit('transaction_updated', {
        ...data,
        timestamp: new Date().toISOString()
      });
    });

    // Handle validator updates
    socket.on('validator_update', (validatorData: ValidatorUpdate) => {
      console.log('Validator updated:', validatorData.validatorId);
      // Broadcast to all clients in blockchain room
      io.to('blockchain').emit('validator_updated', {
        ...validatorData,
        timestamp: new Date().toISOString()
      });
    });

    // Handle blockchain stats updates
    socket.on('stats_update', (stats: {
      totalBlocks: number;
      totalTransactions: number;
      activeValidators: number;
      pendingTransactions: number;
    }) => {
      // Broadcast to all clients in blockchain room
      io.to('blockchain').emit('stats_updated', {
        ...stats,
        timestamp: new Date().toISOString()
      });
    });

    // Handle request for latest data
    socket.on('request_latest_data', () => {
      // Emit latest blockchain data to the requesting client
      socket.emit('latest_data', {
        message: 'Latest blockchain data requested',
        timestamp: new Date().toISOString()
      });
    });

    // Handle custom messages (backward compatibility)
    socket.on('message', (msg: { text: string; senderId: string }) => {
      // Echo: broadcast message only to the client who sent the message
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      connectedClients.delete(socket.id);
      socket.leave('blockchain');
    });

    // Send welcome message with blockchain info
    socket.emit('message', {
      text: 'Welcome to National Budget Blockchain Real-time Updates!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });

    // Send initial connection stats
    socket.emit('connection_stats', {
      connectedClients: connectedClients.size,
      message: 'Connected to blockchain room',
      timestamp: new Date().toISOString(),
    });
  });

  // Simulate blockchain events for demonstration (in production, these would come from actual blockchain events)
  setInterval(() => {
    if (connectedClients.size > 0) {
      // Simulate new block creation
      const blockData: BlockData = {
        height: Math.floor(Math.random() * 1000) + 1000,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        prevHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        merkleRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
        timestamp: new Date().toISOString(),
        proposer: `0x${Math.random().toString(16).substr(2, 40)}`,
        proposerName: ['DBM', 'DICT', 'COA'][Math.floor(Math.random() * 3)],
        transactionCount: Math.floor(Math.random() * 10) + 1,
        size: Math.floor(Math.random() * 100000) + 10000
      };

      io.to('blockchain').emit('block_created', blockData);

      // Simulate new transaction
      if (Math.random() > 0.7) { // 30% chance
        const txData: TransactionData = {
          id: `tx_${Date.now()}`,
          txId: `0x${Math.random().toString(16).substr(2, 64)}`,
          type: ['ISSUE', 'TRANSFER', 'SPEND'][Math.floor(Math.random() * 3)] as 'ISSUE' | 'TRANSFER' | 'SPEND',
          sender: `0x${Math.random().toString(16).substr(2, 40)}`,
          senderName: ['DBM', 'Department of Education', 'Regional Office'][Math.floor(Math.random() * 3)],
          recipient: `0x${Math.random().toString(16).substr(2, 40)}`,
          recipientName: ['Department of Education', 'Regional Office', 'Contractor'][Math.floor(Math.random() * 3)],
          amount: Math.floor(Math.random() * 100000000) + 1000000,
          status: 'PENDING',
          timestamp: new Date().toISOString()
        };

        io.to('blockchain').emit('transaction_created', txData);

        // Simulate transaction confirmation after delay
        setTimeout(() => {
          io.to('blockchain').emit('transaction_updated', {
            txId: txData.txId,
            status: 'CONFIRMED',
            blockHeight: blockData.height,
            timestamp: new Date().toISOString()
          });
        }, 3000);
      }

      // Simulate stats update
      io.to('blockchain').emit('stats_updated', {
        totalBlocks: blockData.height,
        totalTransactions: Math.floor(Math.random() * 10000) + 1000,
        activeValidators: 3,
        pendingTransactions: Math.floor(Math.random() * 20) + 5,
        timestamp: new Date().toISOString()
      });
    }
  }, 10000); // Every 10 seconds
};