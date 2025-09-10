"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Blocks, 
  Search, 
  Hash, 
  Clock, 
  CheckCircle, 
  User,
  ArrowRight,
  Copy,
  Eye,
  ChevronLeft,
  ChevronRight,
  Database,
  Shield,
  Activity
} from 'lucide-react'

interface Block {
  id: string
  height: number
  hash: string
  prevHash: string
  merkleRoot: string
  timestamp: string
  proposer: string
  proposerName: string
  signature: string
  transactionCount: number
  size: number
  difficulty: number
  nonce: number
  version: number
}

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
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
  timestamp: string
  gasUsed: number
  gasPrice: number
  index: number
}

interface MerkleProof {
  blockHeight: number
  transactionIndex: number
  merkleRoot: string
  proof: string[]
  isValid: boolean
}

interface Validator {
  id: string
  name: string
  publicKey: string
  isActive: boolean
  blocksProduced: number
  lastBlockHeight: number
  reputation: number
}

export default function BlockExplorer() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [filteredBlocks, setFilteredBlocks] = useState<Block[]>([])
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [validators, setValidators] = useState<Validator[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [blocksPerPage] = useState(10)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterBlocks()
  }, [blocks, searchTerm])

  const loadData = async () => {
    // Simulate API call with mock data
    setTimeout(() => {
      const mockBlocks: Block[] = Array.from({ length: 50 }, (_, i) => ({
        id: `block_${1250 - i}`,
        height: 1250 - i,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        prevHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        merkleRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        proposer: `0x${Math.random().toString(16).substr(2, 40)}`,
        proposerName: ['DBM', 'DICT', 'COA'][i % 3],
        signature: `0x${Math.random().toString(16).substr(2, 128)}`,
        transactionCount: Math.floor(Math.random() * 10) + 1,
        size: Math.floor(Math.random() * 100000) + 10000,
        difficulty: Math.floor(Math.random() * 1000000) + 100000,
        nonce: Math.floor(Math.random() * 1000000),
        version: 1
      }))

      const mockValidators: Validator[] = [
        {
          id: 'val_001',
          name: 'Department of Budget and Management (DBM)',
          publicKey: '0x742d35Cc6634C0532925a3b844Bc9e7595f8e8C2',
          isActive: true,
          blocksProduced: 417,
          lastBlockHeight: 1250,
          reputation: 98.5
        },
        {
          id: 'val_002',
          name: 'Department of Information and Communications Technology (DICT)',
          publicKey: '0x8ba1f109553bD432803012645Ac136ddd64DBA72',
          isActive: true,
          blocksProduced: 416,
          lastBlockHeight: 1249,
          reputation: 97.8
        },
        {
          id: 'val_003',
          name: 'Commission on Audit (COA)',
          publicKey: '0x5E4b9C5a3C2f4D7e8A9b1C6d3E5f7A8B9C2D4E6F8',
          isActive: true,
          blocksProduced: 417,
          lastBlockHeight: 1248,
          reputation: 99.2
        }
      ]

      setBlocks(mockBlocks)
      setValidators(mockValidators)
      setLoading(false)
    }, 1000)
  }

  const filterBlocks = () => {
    let filtered = blocks

    if (searchTerm) {
      filtered = filtered.filter(block => 
        block.height.toString().includes(searchTerm) ||
        block.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        block.proposerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredBlocks(filtered)
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getValidatorBadge = (proposerName: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'DBM': 'default',
      'DICT': 'secondary',
      'COA': 'destructive'
    }
    
    return <Badge variant={variants[proposerName] || 'default'}>{proposerName}</Badge>
  }

  const handleBlockClick = (block: Block) => {
    setSelectedBlock(block)
  }

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
  }

  const generateMerkleProof = (blockHeight: number, transactionIndex: number): MerkleProof => {
    return {
      blockHeight,
      transactionIndex,
      merkleRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
      proof: Array.from({ length: 5 }, () => `0x${Math.random().toString(16).substr(2, 64)}`),
      isValid: Math.random() > 0.1 // 90% chance of being valid
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Pagination
  const indexOfLastBlock = currentPage * blocksPerPage
  const indexOfFirstBlock = indexOfLastBlock - blocksPerPage
  const currentBlocks = filteredBlocks.slice(indexOfFirstBlock, indexOfLastBlock)
  const totalPages = Math.ceil(filteredBlocks.length / blocksPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const latestBlock = blocks[0]
  const totalBlocks = blocks.length
  const totalTransactions = blocks.reduce((sum, block) => sum + block.transactionCount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading blockchain data...</p>
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
            <CardTitle className="text-sm font-medium">Latest Block</CardTitle>
            <Blocks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{latestBlock?.height || '0'}</div>
            <p className="text-xs text-muted-foreground">
              {latestBlock ? new Date(latestBlock.timestamp).toLocaleString() : 'Loading...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blocks</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalBlocks)}</div>
            <p className="text-xs text-muted-foreground">
              In blockchain
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalTransactions)}</div>
            <p className="text-xs text-muted-foreground">
              Across all blocks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Validators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validators.length}</div>
            <p className="text-xs text-muted-foreground">
              Securing the network
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="explorer" className="space-y-6">
        <TabsList>
          <TabsTrigger value="explorer">Block Explorer</TabsTrigger>
          <TabsTrigger value="validators">Validators</TabsTrigger>
        </TabsList>

        <TabsContent value="explorer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Block Explorer</CardTitle>
              <CardDescription>Explore blocks and transactions on the National Budget Blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by block height, hash, or validator..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear
                </Button>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {currentBlocks.map((block) => (
                    <Card key={block.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleBlockClick(block)}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <Blocks className="h-6 w-6 text-primary" />
                              <div>
                                <h3 className="font-semibold text-lg">Block #{block.height}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(block.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mb-3">
                              {getValidatorBadge(block.proposerName)}
                              <Badge variant="outline" className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3" />
                                <span>Confirmed</span>
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Transactions</div>
                                <div className="font-medium">{block.transactionCount}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Size</div>
                                <div className="font-medium">{formatBytes(block.size)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Difficulty</div>
                                <div className="font-medium">{formatNumber(block.difficulty)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Nonce</div>
                                <div className="font-medium">{block.nonce}</div>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t">
                              <div className="text-sm text-muted-foreground font-mono">
                                Hash: {block.hash.substring(0, 20)}...
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {indexOfFirstBlock + 1} to {Math.min(indexOfLastBlock, filteredBlocks.length)} of {filteredBlocks.length} blocks
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validators" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Network Validators</CardTitle>
              <CardDescription>Authorized validators securing the National Budget Blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {validators.map((validator) => (
                    <Card key={validator.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <Shield className="h-6 w-6 text-primary" />
                              <div>
                                <h3 className="font-semibold text-lg">{validator.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {validator.publicKey.substring(0, 20)}...
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mb-3">
                              <Badge variant={validator.isActive ? "default" : "secondary"}>
                                {validator.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="outline">
                                Reputation: {validator.reputation}%
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Blocks Produced</div>
                                <div className="font-medium">{formatNumber(validator.blocksProduced)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Last Block</div>
                                <div className="font-medium">#{validator.lastBlockHeight}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Status</div>
                                <div className="font-medium text-green-600">Online</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Block Details Dialog */}
      {selectedBlock && (
        <Dialog open={!!selectedBlock} onOpenChange={() => setSelectedBlock(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Block #{selectedBlock.height} Details</DialogTitle>
              <DialogDescription>Complete block information and transactions</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Block Height</Label>
                  <div className="text-lg font-semibold">#{selectedBlock.height}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Timestamp</Label>
                  <div className="text-sm">{new Date(selectedBlock.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Block Hash</Label>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-mono bg-muted p-2 rounded">
                      {selectedBlock.hash}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(selectedBlock.hash)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Previous Hash</Label>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-mono bg-muted p-2 rounded">
                      {selectedBlock.prevHash}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(selectedBlock.prevHash)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Merkle Root</Label>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-mono bg-muted p-2 rounded">
                      {selectedBlock.merkleRoot}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(selectedBlock.merkleRoot)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Proposer</Label>
                  <div className="flex items-center space-x-2">
                    <div>{getValidatorBadge(selectedBlock.proposerName)}</div>
                    <div className="text-sm font-mono text-muted-foreground">
                      {selectedBlock.proposer}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Transactions</Label>
                  <div className="text-lg font-semibold">{selectedBlock.transactionCount}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Block Size</Label>
                  <div className="text-lg font-semibold">{formatBytes(selectedBlock.size)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Difficulty</Label>
                  <div className="text-lg font-semibold">{formatNumber(selectedBlock.difficulty)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Nonce</Label>
                  <div className="text-lg font-semibold">{selectedBlock.nonce}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Version</Label>
                  <div className="text-lg font-semibold">{selectedBlock.version}</div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Signature</Label>
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-mono bg-muted p-2 rounded break-all">
                    {selectedBlock.signature}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(selectedBlock.signature)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium mb-3 block">Transactions</Label>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {Array.from({ length: selectedBlock.transactionCount }, (_, i) => {
                      const tx: Transaction = {
                        id: `tx_${selectedBlock.height}_${i}`,
                        txId: `0x${Math.random().toString(16).substr(2, 64)}`,
                        type: ['ISSUE', 'TRANSFER', 'SPEND'][i % 3] as 'ISSUE' | 'TRANSFER' | 'SPEND',
                        sender: `0x${Math.random().toString(16).substr(2, 40)}`,
                        senderName: ['DBM', 'Department of Education', 'Regional Office'][i % 3],
                        recipient: `0x${Math.random().toString(16).substr(2, 40)}`,
                        recipientName: ['Department of Education', 'Regional Office', 'Contractor'][i % 3],
                        amount: Math.floor(Math.random() * 100000000) + 1000000,
                        nonce: i + 1,
                        status: 'CONFIRMED',
                        timestamp: selectedBlock.timestamp,
                        gasUsed: Math.floor(Math.random() * 50000) + 21000,
                        gasPrice: Math.floor(Math.random() * 100) + 20,
                        index: i
                      }
                      
                      return (
                        <Card key={tx.id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => handleTransactionClick(tx)}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="text-sm font-medium">{tx.txId.substring(0, 16)}...</div>
                                  <div className="text-xs text-muted-foreground">
                                    {tx.senderName} → {tx.recipientName}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">{formatCurrency(tx.amount)}</div>
                                <div className="text-xs text-muted-foreground">
                                  Gas: {tx.gasUsed}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

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
                  <div>
                    <Badge variant="default" className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>{selectedTransaction.status}</span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <div>
                    <Badge variant="secondary">{selectedTransaction.type}</Badge>
                  </div>
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
                  <Label className="text-sm font-medium">Gas Used</Label>
                  <div className="font-medium">{formatNumber(selectedTransaction.gasUsed)}</div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium mb-3 block">Merkle Proof</Label>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const proof = generateMerkleProof(selectedBlock?.height || 0, selectedTransaction.index)
                    alert(`Merkle Proof:\nBlock Height: ${proof.blockHeight}\nTransaction Index: ${proof.transactionIndex}\nValid: ${proof.isValid}\nProof: ${proof.proof.join('\n')}`)
                  }}
                >
                  Generate Merkle Proof
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}