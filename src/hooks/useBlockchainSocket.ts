'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

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

interface BlockchainStats {
  totalBlocks: number;
  totalTransactions: number;
  activeValidators: number;
  pendingTransactions: number;
}

interface UseBlockchainSocketReturn {
  isConnected: boolean;
  latestBlock: BlockData | null;
  latestTransaction: TransactionData | null;
  stats: BlockchainStats | null;
  connectionStats: { connectedClients: number; message: string } | null;
  notifications: Array<{
    id: string;
    type: 'block' | 'transaction' | 'stats';
    message: string;
    timestamp: string;
    data?: any;
  }>;
  clearNotifications: () => void;
}

export const useBlockchainSocket = (): UseBlockchainSocketReturn => {
  const [isConnected, setIsConnected] = useState(false)
  const [latestBlock, setLatestBlock] = useState<BlockData | null>(null)
  const [latestTransaction, setLatestTransaction] = useState<TransactionData | null>(null)
  const [stats, setStats] = useState<BlockchainStats | null>(null)
  const [connectionStats, setConnectionStats] = useState<{ connectedClients: number; message: string } | null>(null)
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'block' | 'transaction' | 'stats';
    message: string;
    timestamp: string;
    data?: any;
  }>>([])

  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize socket connection
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 5000,
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to blockchain socket server')
      setIsConnected(true)
      
      // Add notification
      addNotification('stats', 'Connected to blockchain real-time updates')
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from blockchain socket server')
      setIsConnected(false)
      
      // Add notification
      addNotification('stats', 'Disconnected from blockchain real-time updates')
    })

    // Blockchain events
    socket.on('block_created', (blockData: BlockData) => {
      console.log('New block created:', blockData.height)
      setLatestBlock(blockData)
      
      // Add notification
      addNotification('block', `New block #${blockData.height} created`, blockData)
    })

    socket.on('transaction_created', (txData: TransactionData) => {
      console.log('New transaction created:', txData.txId)
      setLatestTransaction(txData)
      
      // Add notification
      addNotification('transaction', `New ${txData.type} transaction: ${formatCurrency(txData.amount)}`, txData)
    })

    socket.on('transaction_updated', (data: { txId: string; status: string; blockHeight?: number }) => {
      console.log('Transaction updated:', data.txId, data.status)
      
      // Add notification
      addNotification('transaction', `Transaction ${data.txId.substring(0, 16)}... ${data.status}`, data)
    })

    socket.on('stats_updated', (statsData: BlockchainStats) => {
      console.log('Stats updated:', statsData)
      setStats(statsData)
    })

    socket.on('connection_stats', (stats: { connectedClients: number; message: string }) => {
      console.log('Connection stats:', stats)
      setConnectionStats(stats)
    })

    socket.on('message', (msg: { text: string; senderId: string; timestamp: string }) => {
      console.log('Message received:', msg)
      addNotification('stats', msg.text)
    })

    // Request latest data on connection
    socket.on('connect', () => {
      socket.emit('request_latest_data')
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const addNotification = (type: 'block' | 'transaction' | 'stats', message: string, data?: any) => {
    const notification = {
      id: `${type}_${Date.now()}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      data
    }
    
    setNotifications(prev => {
      // Keep only last 10 notifications
      const updated = [notification, ...prev].slice(0, 10)
      return updated
    })
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return {
    isConnected,
    latestBlock,
    latestTransaction,
    stats,
    connectionStats,
    notifications,
    clearNotifications
  }
}