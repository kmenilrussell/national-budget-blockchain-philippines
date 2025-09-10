"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { 
  Blocks, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Building2,
  BarChart3,
  Activity,
  Search
} from 'lucide-react'
import DepartmentManagement from '@/components/DepartmentManagement'
import TransactionManagement from '@/components/TransactionManagement'
import BlockExplorer from '@/components/BlockExplorer'
import RealTimeNotifications from '@/components/RealTimeNotifications'

interface BlockchainStats {
  totalBlocks: number
  totalTransactions: number
  totalAccounts: number
  totalBudget: number
  latestBlockHeight: number
  pendingTransactions: number
  activeValidators: number
}

interface RecentTransaction {
  id: string
  type: 'ISSUE' | 'TRANSFER' | 'SPEND'
  amount: number
  sender: string
  recipient: string
  timestamp: string
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
}

interface GovernmentDepartment {
  id: string
  name: string
  type: string
  budget: number
  spent: number
  transactions: number
  status: 'ACTIVE' | 'INACTIVE'
}

export default function Home() {
  const [stats, setStats] = useState<BlockchainStats>({
    totalBlocks: 0,
    totalTransactions: 0,
    totalAccounts: 0,
    totalBudget: 0,
    latestBlockHeight: 0,
    pendingTransactions: 0,
    activeValidators: 0
  })

  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [departments, setDepartments] = useState<GovernmentDepartment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate initial data loading
    const loadInitialData = async () => {
      // Mock data for demonstration
      setStats({
        totalBlocks: 1250,
        totalTransactions: 8450,
        totalAccounts: 45,
        totalBudget: 28500000000, // 28.5B PHP
        latestBlockHeight: 1250,
        pendingTransactions: 12,
        activeValidators: 3
      })

      setRecentTransactions([
        {
          id: 'tx_001',
          type: 'ISSUE',
          amount: 50000000,
          sender: 'DBM',
          recipient: 'Department of Education',
          timestamp: '2024-01-15T10:30:00Z',
          status: 'CONFIRMED'
        },
        {
          id: 'tx_002',
          type: 'TRANSFER',
          amount: 25000000,
          sender: 'Department of Education',
          recipient: 'Regional Office IX',
          timestamp: '2024-01-15T11:45:00Z',
          status: 'CONFIRMED'
        },
        {
          id: 'tx_003',
          type: 'SPEND',
          amount: 5000000,
          sender: 'Regional Office IX',
          recipient: 'Construction Contractor',
          timestamp: '2024-01-15T14:20:00Z',
          status: 'PENDING'
        }
      ])

      setDepartments([
        {
          id: 'dept_001',
          name: 'Department of Education',
          type: 'GOVERNMENT_AGENCY',
          budget: 8500000000,
          spent: 3200000000,
          transactions: 1250,
          status: 'ACTIVE'
        },
        {
          id: 'dept_002',
          name: 'Department of Health',
          type: 'GOVERNMENT_AGENCY',
          budget: 6200000000,
          spent: 2800000000,
          transactions: 980,
          status: 'ACTIVE'
        },
        {
          id: 'dept_003',
          name: 'Department of Public Works and Highways',
          type: 'GOVERNMENT_AGENCY',
          budget: 7200000000,
          spent: 4100000000,
          transactions: 1450,
          status: 'ACTIVE'
        },
        {
          id: 'dept_004',
          name: 'Department of Agriculture',
          type: 'GOVERNMENT_AGENCY',
          budget: 2800000000,
          spent: 1200000000,
          transactions: 650,
          status: 'ACTIVE'
        }
      ])

      setLoading(false)
    }

    loadInitialData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-PH').format(num)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'CONFIRMED': 'default',
      'PENDING': 'secondary',
      'REJECTED': 'destructive',
      'ACTIVE': 'default',
      'INACTIVE': 'secondary'
    }
    
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getTransactionTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'ISSUE': 'default',
      'TRANSFER': 'secondary',
      'SPEND': 'outline'
    }
    
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading National Budget Blockchain...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-10 h-10">
                <img
                  src="/logo.svg"
                  alt="NBB Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">National Budget Blockchain</h1>
                <p className="text-sm text-muted-foreground">
                  Transparent & Traceable Public Fund Management
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>Blockchain Active</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{stats.activeValidators} Validators</span>
              </Badge>
              <RealTimeNotifications />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Blocks</CardTitle>
              <Blocks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalBlocks)}</div>
              <p className="text-xs text-muted-foreground">
                Latest: #{stats.latestBlockHeight}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalTransactions)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingTransactions} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
              <p className="text-xs text-muted-foreground">
                Across all departments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalAccounts)}</div>
              <p className="text-xs text-muted-foreground">
                Government agencies
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="blocks">Blocks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest budget allocations and transfers</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {recentTransactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-2">
                                {getTransactionTypeBadge(tx.type)}
                                <span className="text-sm font-medium">{tx.id}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {tx.sender} → {tx.recipient}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(tx.amount)}</div>
                            <div className="flex items-center justify-end space-x-1">
                              <Clock className="h-3 w-3" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(tx.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            {getStatusBadge(tx.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Department Budget Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Department Budget Overview</CardTitle>
                  <CardDescription>Budget allocation and spending status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {departments.slice(0, 5).map((dept) => {
                        const spentPercentage = (dept.spent / dept.budget) * 100
                        return (
                          <div key={dept.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Building2 className="h-4 w-4" />
                                <span className="font-medium">{dept.name}</span>
                              </div>
                              {getStatusBadge(dept.status)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(dept.spent)} of {formatCurrency(dept.budget)}
                            </div>
                            <Progress value={spentPercentage} className="h-2" />
                            <div className="text-xs text-muted-foreground">
                              {spentPercentage.toFixed(1)}% spent • {dept.transactions} transactions
                            </div>
                            <Separator />
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <DepartmentManagement />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionManagement />
          </TabsContent>

          <TabsContent value="blocks" className="space-y-6">
            <BlockExplorer />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}