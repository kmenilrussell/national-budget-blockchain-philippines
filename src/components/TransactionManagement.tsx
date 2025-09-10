"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Search, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Filter,
  Download,
  Eye,
  Hash,
  Building2
} from 'lucide-react'

interface Transaction {
  id: string
  txId: string
  type: 'ISSUE' | 'TRANSFER' | 'SPEND'
  sender: string
  senderName: string
  recipient: string
  recipientName: string
  amount: number
  nonce: number
  data?: string
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
  timestamp: string
  blockHeight?: number
  blockHash?: string
}

interface BudgetAllocation {
  id: string
  departmentName: string
  departmentAddress: string
  totalBudget: number
  allocatedBudget: number
  spentBudget: number
  remainingBudget: number
  transactionCount: number
  lastUpdated: string
}

interface TransactionFormData {
  type: 'ISSUE' | 'TRANSFER' | 'SPEND'
  sender: string
  recipient: string
  amount: number
  description: string
}

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [budgetAllocations, setBudgetAllocations] = useState<BudgetAllocation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [filterDateRange, setFilterDateRange] = useState<string>('ALL')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'TRANSFER',
    sender: '',
    recipient: '',
    amount: 0,
    description: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, filterType, filterStatus, filterDateRange])

  const loadData = async () => {
    // Simulate API call with mock data
    setTimeout(() => {
      const mockTransactions: Transaction[] = [
        {
          id: 'tx_001',
          txId: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
          type: 'ISSUE',
          sender: '0x0000000000000000000000000000000000000000',
          senderName: 'DBM (Budget Authority)',
          recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f8e8C2',
          recipientName: 'Department of Education',
          amount: 50000000,
          nonce: 1,
          status: 'CONFIRMED',
          timestamp: '2024-01-15T10:30:00Z',
          blockHeight: 1248,
          blockHash: '0xabcdef1234567890abcdef1234567890abcdef12'
        },
        {
          id: 'tx_002',
          txId: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234',
          type: 'TRANSFER',
          sender: '0x742d35Cc6634C0532925a3b844Bc9e7595f8e8C2',
          senderName: 'Department of Education',
          recipient: '0x8ba1f109553bD432803012645Ac136ddd64DBA72',
          recipientName: 'Regional Office IX',
          amount: 25000000,
          nonce: 2,
          status: 'CONFIRMED',
          timestamp: '2024-01-15T11:45:00Z',
          blockHeight: 1249,
          blockHash: '0xbcdef1234567890abcdef1234567890abcdef1234'
        },
        {
          id: 'tx_003',
          txId: '0x3c4d5e6f7890abcdef1234567890abcdef123456',
          type: 'SPEND',
          sender: '0x8ba1f109553bD432803012645Ac136ddd64DBA72',
          senderName: 'Regional Office IX',
          recipient: '0x5E4b9C5a3C2f4D7e8A9b1C6d3E5f7A8B9C2D4E6F8',
          recipientName: 'Construction Contractor',
          amount: 5000000,
          nonce: 1,
          status: 'PENDING',
          timestamp: '2024-01-15T14:20:00Z'
        },
        {
          id: 'tx_004',
          txId: '0x4d5e6f7890abcdef1234567890abcdef12345678',
          type: 'ISSUE',
          sender: '0x0000000000000000000000000000000000000000',
          senderName: 'DBM (Budget Authority)',
          recipient: '0x8ba1f109553bD432803012645Ac136ddd64DBA72',
          recipientName: 'Department of Health',
          amount: 35000000,
          nonce: 2,
          status: 'CONFIRMED',
          timestamp: '2024-01-15T09:15:00Z',
          blockHeight: 1247,
          blockHash: '0xcdef1234567890abcdef1234567890abcdef12345'
        },
        {
          id: 'tx_005',
          txId: '0x5e6f7890abcdef1234567890abcdef1234567890',
          type: 'TRANSFER',
          sender: '0x8ba1f109553bD432803012645Ac136ddd64DBA72',
          senderName: 'Department of Health',
          recipient: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
          recipientName: 'Medical Supplies Contractor',
          amount: 15000000,
          nonce: 3,
          status: 'CONFIRMED',
          timestamp: '2024-01-15T12:30:00Z',
          blockHeight: 1250,
          blockHash: '0xdef1234567890abcdef1234567890abcdef123456'
        }
      ]

      const mockBudgetAllocations: BudgetAllocation[] = [
        {
          id: 'alloc_001',
          departmentName: 'Department of Education',
          departmentAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f8e8C2',
          totalBudget: 8500000000,
          allocatedBudget: 8500000000,
          spentBudget: 3200000000,
          remainingBudget: 5300000000,
          transactionCount: 1250,
          lastUpdated: '2024-01-15T10:30:00Z'
        },
        {
          id: 'alloc_002',
          departmentName: 'Department of Health',
          departmentAddress: '0x8ba1f109553bD432803012645Ac136ddd64DBA72',
          totalBudget: 6200000000,
          allocatedBudget: 6200000000,
          spentBudget: 2800000000,
          remainingBudget: 3400000000,
          transactionCount: 980,
          lastUpdated: '2024-01-15T11:45:00Z'
        },
        {
          id: 'alloc_003',
          departmentName: 'Department of Public Works and Highways',
          departmentAddress: '0x5E4b9C5a3C2f4D7e8A9b1C6d3E5f7A8B9C2D4E6F8',
          totalBudget: 7200000000,
          allocatedBudget: 7200000000,
          spentBudget: 4100000000,
          remainingBudget: 3100000000,
          transactionCount: 1450,
          lastUpdated: '2024-01-15T14:20:00Z'
        },
        {
          id: 'alloc_004',
          departmentName: 'Department of Agriculture',
          departmentAddress: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
          totalBudget: 2800000000,
          allocatedBudget: 2800000000,
          spentBudget: 1200000000,
          remainingBudget: 1600000000,
          transactionCount: 650,
          lastUpdated: '2024-01-15T09:15:00Z'
        }
      ]

      setTransactions(mockTransactions)
      setBudgetAllocations(mockBudgetAllocations)
      setLoading(false)
    }, 1000)
  }

  const filterTransactions = () => {
    let filtered = transactions

    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.txId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== 'ALL') {
      filtered = filtered.filter(tx => tx.type === filterType)
    }

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(tx => tx.status === filterStatus)
    }

    if (filterDateRange !== 'ALL') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (filterDateRange) {
        case 'TODAY':
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case 'WEEK':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'MONTH':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
      }
      
      filtered = filtered.filter(tx => new Date(tx.timestamp) >= cutoffDate)
    }

    setFilteredTransactions(filtered)
  }

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
      'REJECTED': 'destructive'
    }
    
    return (
      <Badge variant={variants[status] || 'default'} className="flex items-center space-x-1">
        {status === 'CONFIRMED' ? <CheckCircle className="h-3 w-3" /> : 
         status === 'PENDING' ? <Clock className="h-3 w-3" /> : 
         <AlertCircle className="h-3 w-3" />}
        <span>{status}</span>
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'ISSUE': 'default',
      'TRANSFER': 'secondary',
      'SPEND': 'outline'
    }
    
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>
  }

  const handleCreateTransaction = () => {
    if (!formData.sender || !formData.recipient || formData.amount <= 0) {
      alert('Please fill in all required fields with valid values')
      return
    }

    // Get sender and recipient names based on addresses
    const getEntityName = (address: string) => {
      const names: Record<string, string> = {
        '0x0000000000000000000000000000000000000000': 'DBM (Budget Authority)',
        '0x742d35Cc6634C0532925a3b844Bc9e7595f8e8C2': 'Department of Education',
        '0x8ba1f109553bD432803012645Ac136ddd64DBA72': 'Department of Health',
        '0x5E4b9C5a3C2f4D7e8A9b1C6d3E5f7A8B9C2D4E6F8': 'DPWH',
        '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12': 'Agriculture',
        '0x2b3c4d5e6f7890abcdef1234567890abcdef1234': 'Contractor'
      }
      return names[address] || 'Unknown Entity'
    }

    // Simulate API call
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      txId: `0x${Math.random().toString(16).substr(2, 64)}`,
      type: formData.type,
      sender: formData.sender,
      senderName: getEntityName(formData.sender),
      recipient: formData.recipient,
      recipientName: getEntityName(formData.recipient),
      amount: formData.amount,
      nonce: transactions.length + 1,
      status: 'PENDING',
      timestamp: new Date().toISOString()
    }

    setTransactions([newTransaction, ...transactions])
    setFormData({
      type: 'TRANSFER',
      sender: '',
      recipient: '',
      amount: 0,
      description: ''
    })
    setIsCreateDialogOpen(false)
  }

  const handleExportData = () => {
    // Create CSV content
    const headers = ['Transaction ID', 'Type', 'Sender', 'Recipient', 'Amount', 'Status', 'Timestamp']
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(tx => [
        tx.txId,
        tx.type,
        tx.senderName,
        tx.recipientName,
        tx.amount,
        tx.status,
        new Date(tx.timestamp).toLocaleString()
      ].join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0)
  const confirmedTransactions = transactions.filter(tx => tx.status === 'CONFIRMED').length
  const pendingTransactions = transactions.filter(tx => tx.status === 'PENDING').length
  const totalAllocated = budgetAllocations.reduce((sum, alloc) => sum + alloc.allocatedBudget, 0)
  const totalSpent = budgetAllocations.reduce((sum, alloc) => sum + alloc.spentBudget, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading transaction data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalVolume)}</div>
            <p className="text-xs text-muted-foreground">
              All transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(confirmedTransactions)}</div>
            <p className="text-xs text-muted-foreground">
              {pendingTransactions} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Allocated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAllocated)}</div>
            <p className="text-xs text-muted-foreground">
              To departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Spent</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalSpent / totalAllocated) * 100).toFixed(1)}% utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            <TabsTrigger value="allocations">Budget Allocations</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>New Transaction</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Transaction</DialogTitle>
                  <DialogDescription>Create a new budget allocation or transfer</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tx-type">Transaction Type</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ISSUE">Issue Budget</SelectItem>
                        <SelectItem value="TRANSFER">Transfer Funds</SelectItem>
                        <SelectItem value="SPEND">Spend Funds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sender">Sender</Label>
                    <Select value={formData.sender} onValueChange={(value) => setFormData({...formData, sender: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0x0000000000000000000000000000000000000000">DBM (Budget Authority)</SelectItem>
                        <SelectItem value="0x742d35Cc6634C0532925a3b844Bc9e7595f8e8C2">Department of Education</SelectItem>
                        <SelectItem value="0x8ba1f109553bD432803012645Ac136ddd64DBA72">Department of Health</SelectItem>
                        <SelectItem value="0x5E4b9C5a3C2f4D7e8A9b1C6d3E5f7A8B9C2D4E6F8">DPWH</SelectItem>
                        <SelectItem value="0x1a2b3c4d5e6f7890abcdef1234567890abcdef12">Agriculture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="recipient">Recipient</Label>
                    <Select value={formData.recipient} onValueChange={(value) => setFormData({...formData, recipient: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0x742d35Cc6634C0532925a3b844Bc9e7595f8e8C2">Department of Education</SelectItem>
                        <SelectItem value="0x8ba1f109553bD432803012645Ac136ddd64DBA72">Department of Health</SelectItem>
                        <SelectItem value="0x5E4b9C5a3C2f4D7e8A9b1C6d3E5f7A8B9C2D4E6F8">DPWH</SelectItem>
                        <SelectItem value="0x1a2b3c4d5e6f7890abcdef1234567890abcdef12">Agriculture</SelectItem>
                        <SelectItem value="0x2b3c4d5e6f7890abcdef1234567890abcdef1234">Contractor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Enter description"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTransaction}>
                      Create Transaction
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All blockchain transactions and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="ISSUE">Issue</SelectItem>
                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                    <SelectItem value="SPEND">Spend</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Time</SelectItem>
                    <SelectItem value="TODAY">Today</SelectItem>
                    <SelectItem value="WEEK">This Week</SelectItem>
                    <SelectItem value="MONTH">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredTransactions.map((tx) => (
                    <Card key={tx.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <Hash className="h-5 w-5 text-primary" />
                              <div className="flex items-center space-x-2">
                                {getTypeBadge(tx.type)}
                                {getStatusBadge(tx.status)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium">{tx.senderName}</span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{tx.recipientName}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mb-3">
                              {tx.txId.substring(0, 20)}...
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <div className="text-sm text-muted-foreground">Amount</div>
                                <div className="font-medium text-lg">{formatCurrency(tx.amount)}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Nonce</div>
                                <div className="font-medium">#{tx.nonce}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Time</div>
                                <div className="font-medium">
                                  {new Date(tx.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            {tx.blockHeight && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="text-sm text-muted-foreground">
                                  Block #{tx.blockHeight} • {tx.blockHash?.substring(0, 16)}...
                                </div>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTransaction(tx)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Allocations</CardTitle>
              <CardDescription>Department-wise budget allocation and utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {budgetAllocations.map((allocation) => {
                    const utilizationPercentage = allocation.allocatedBudget > 0 
                      ? (allocation.spentBudget / allocation.allocatedBudget) * 100 
                      : 0
                    const remainingPercentage = allocation.allocatedBudget > 0 
                      ? (allocation.remainingBudget / allocation.allocatedBudget) * 100 
                      : 0
                    
                    return (
                      <Card key={allocation.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <Building2 className="h-6 w-6 text-primary" />
                                <div>
                                  <h3 className="font-semibold text-lg">{allocation.departmentName}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {allocation.departmentAddress.substring(0, 20)}...
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <div className="text-sm text-muted-foreground">Total Budget</div>
                                  <div className="font-medium">{formatCurrency(allocation.totalBudget)}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Allocated</div>
                                  <div className="font-medium">{formatCurrency(allocation.allocatedBudget)}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Spent</div>
                                  <div className="font-medium">{formatCurrency(allocation.spentBudget)}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Remaining</div>
                                  <div className="font-medium">{formatCurrency(allocation.remainingBudget)}</div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Budget Utilization</span>
                                    <span>{utilizationPercentage.toFixed(1)}%</span>
                                  </div>
                                  <Progress value={utilizationPercentage} className="h-2" />
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Remaining Budget</span>
                                    <span>{remainingPercentage.toFixed(1)}%</span>
                                  </div>
                                  <Progress value={remainingPercentage} className="h-2" variant="secondary" />
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                                {allocation.transactionCount} transactions • Last updated {new Date(allocation.lastUpdated).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>Complete transaction information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Transaction ID</Label>
                  <div className="text-sm text-muted-foreground font-mono">
                    {selectedTransaction.txId}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div>{getStatusBadge(selectedTransaction.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <div>{getTypeBadge(selectedTransaction.type)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <div className="font-medium">{formatCurrency(selectedTransaction.amount)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Sender</Label>
                  <div className="text-sm">
                    <div>{selectedTransaction.senderName}</div>
                    <div className="text-muted-foreground font-mono text-xs">
                      {selectedTransaction.sender}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Recipient</Label>
                  <div className="text-sm">
                    <div>{selectedTransaction.recipientName}</div>
                    <div className="text-muted-foreground font-mono text-xs">
                      {selectedTransaction.recipient}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Nonce</Label>
                  <div className="font-medium">#{selectedTransaction.nonce}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Timestamp</Label>
                  <div className="text-sm">
                    {new Date(selectedTransaction.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              {selectedTransaction.blockHeight && (
                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium">Block Information</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Block Height</div>
                      <div className="font-medium">#{selectedTransaction.blockHeight}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Block Hash</div>
                      <div className="font-mono text-sm">
                        {selectedTransaction.blockHash}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}