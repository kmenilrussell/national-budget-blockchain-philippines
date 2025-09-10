"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Bell, 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Blocks, 
  TrendingUp,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useBlockchainSocket } from '@/hooks/useBlockchainSocket'

interface RealTimeNotificationsProps {
  maxNotifications?: number
}

export default function RealTimeNotifications({ maxNotifications = 10 }: RealTimeNotificationsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { 
    isConnected, 
    notifications, 
    clearNotifications, 
    latestBlock, 
    latestTransaction,
    stats 
  } = useBlockchainSocket()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'block':
        return <Blocks className="h-4 w-4 text-blue-500" />
      case 'transaction':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'stats':
        return <Activity className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'block':
        return 'border-blue-200 bg-blue-50'
      case 'transaction':
        return 'border-green-200 bg-green-50'
      case 'stats':
        return 'border-purple-200 bg-purple-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const unreadCount = notifications.length

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="relative"
      >
        {isConnected ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <Bell className="h-4 w-4 ml-2" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isVisible && (
        <Card className="absolute right-0 top-12 w-96 z-50 shadow-xl border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Real-time Updates</CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  {isConnected ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Connected to blockchain</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <span>Disconnected</span>
                    </>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearNotifications}>
                    Clear All
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Live Stats */}
            {(latestBlock || latestTransaction || stats) && (
              <>
                <div className="p-4 border-b">
                  <h4 className="font-medium mb-3">Live Activity</h4>
                  <div className="space-y-2">
                    {stats && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Blocks:</span>
                        <span className="font-medium">#{stats.totalBlocks}</span>
                      </div>
                    )}
                    {stats && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pending TXs:</span>
                        <span className="font-medium">{stats.pendingTransactions}</span>
                      </div>
                    )}
                    {latestBlock && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Latest Block:</span>
                        <span className="font-medium">#{latestBlock.height}</span>
                      </div>
                    )}
                    {latestTransaction && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Latest TX:</span>
                        <span className="font-medium">{formatCurrency(latestTransaction.amount)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Notifications List */}
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                  <p className="text-xs">Real-time updates will appear here</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 ${getNotificationColor(notification.type)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">
                              {notification.message}
                            </p>
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                          {notification.data && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {notification.type === 'block' && (
                                <div>
                                  Block #{notification.data.height} • {notification.data.transactionCount} transactions
                                </div>
                              )}
                              {notification.type === 'transaction' && (
                                <div>
                                  {notification.data.senderName} → {notification.data.recipientName}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}