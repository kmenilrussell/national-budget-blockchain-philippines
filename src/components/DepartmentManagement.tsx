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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  DollarSign, 
  TrendingUp, 
  Users,
  Activity,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react'

interface Department {
  id: string
  name: string
  type: 'GOVERNMENT_AGENCY' | 'DEPARTMENT' | 'CONTRACTOR' | 'PROJECT' | 'CITIZEN'
  budget: number
  spent: number
  transactions: number
  status: 'ACTIVE' | 'INACTIVE'
  address?: string
  description?: string
  createdAt: string
  updatedAt: string
}

interface DepartmentFormData {
  name: string
  type: 'GOVERNMENT_AGENCY' | 'DEPARTMENT' | 'CONTRACTOR' | 'PROJECT' | 'CITIZEN'
  budget: number
  address: string
  description: string
}

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    type: 'GOVERNMENT_AGENCY',
    budget: 0,
    address: '',
    description: ''
  })

  useEffect(() => {
    loadDepartments()
  }, [])

  useEffect(() => {
    filterDepartments()
  }, [departments, searchTerm, filterType, filterStatus])

  const loadDepartments = async () => {
    // Simulate API call with mock data
    setTimeout(() => {
      const mockDepartments: Department[] = [
        {
          id: 'dept_001',
          name: 'Department of Education',
          type: 'GOVERNMENT_AGENCY',
          budget: 8500000000,
          spent: 3200000000,
          transactions: 1250,
          status: 'ACTIVE',
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8e8C2',
          description: 'Primary agency responsible for education and literacy programs',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 'dept_002',
          name: 'Department of Health',
          type: 'GOVERNMENT_AGENCY',
          budget: 6200000000,
          spent: 2800000000,
          transactions: 980,
          status: 'ACTIVE',
          address: '0x8ba1f109553bD432803012645Ac136ddd64DBA72',
          description: 'Agency responsible for public health and healthcare services',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T11:45:00Z'
        },
        {
          id: 'dept_003',
          name: 'Department of Public Works and Highways',
          type: 'GOVERNMENT_AGENCY',
          budget: 7200000000,
          spent: 4100000000,
          transactions: 1450,
          status: 'ACTIVE',
          address: '0x5E4b9C5a3C2f4D7e8A9b1C6d3E5f7A8B9C2D4E6F8',
          description: 'Infrastructure development and public works agency',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T14:20:00Z'
        },
        {
          id: 'dept_004',
          name: 'Department of Agriculture',
          type: 'GOVERNMENT_AGENCY',
          budget: 2800000000,
          spent: 1200000000,
          transactions: 650,
          status: 'ACTIVE',
          address: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
          description: 'Agricultural development and food security agency',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T09:15:00Z'
        },
        {
          id: 'dept_005',
          name: 'Department of Labor and Employment',
          type: 'GOVERNMENT_AGENCY',
          budget: 1500000000,
          spent: 750000000,
          transactions: 420,
          status: 'ACTIVE',
          address: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234',
          description: 'Labor policies and employment programs',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T13:00:00Z'
        },
        {
          id: 'dept_006',
          name: 'Department of Tourism',
          type: 'GOVERNMENT_AGENCY',
          budget: 800000000,
          spent: 320000000,
          transactions: 280,
          status: 'ACTIVE',
          address: '0x3c4d5e6f7890abcdef1234567890abcdef123456',
          description: 'Tourism promotion and development',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T16:30:00Z'
        }
      ]
      setDepartments(mockDepartments)
      setLoading(false)
    }, 1000)
  }

  const filterDepartments = () => {
    let filtered = departments

    if (searchTerm) {
      filtered = filtered.filter(dept => 
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== 'ALL') {
      filtered = filtered.filter(dept => dept.type === filterType)
    }

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(dept => dept.status === filterStatus)
    }

    setFilteredDepartments(filtered)
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
      'ACTIVE': 'default',
      'INACTIVE': 'secondary'
    }
    
    return (
      <Badge variant={variants[status] || 'default'} className="flex items-center space-x-1">
        {status === 'ACTIVE' ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
        <span>{status}</span>
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'GOVERNMENT_AGENCY': 'default',
      'DEPARTMENT': 'secondary',
      'CONTRACTOR': 'outline',
      'PROJECT': 'destructive',
      'CITIZEN': 'secondary'
    }
    
    return <Badge variant={variants[type] || 'default'}>{type.replace('_', ' ')}</Badge>
  }

  const handleAddDepartment = () => {
    // Simulate API call
    const newDepartment: Department = {
      id: `dept_${Date.now()}`,
      name: formData.name,
      type: formData.type,
      budget: formData.budget,
      spent: 0,
      transactions: 0,
      status: 'ACTIVE',
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      description: formData.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setDepartments([...departments, newDepartment])
    setFormData({
      name: '',
      type: 'GOVERNMENT_AGENCY',
      budget: 0,
      address: '',
      description: ''
    })
    setIsAddDialogOpen(false)
  }

  const handleEditDepartment = () => {
    if (!selectedDepartment) return

    const updatedDepartments = departments.map(dept => 
      dept.id === selectedDepartment.id 
        ? { ...dept, ...formData, updatedAt: new Date().toISOString() }
        : dept
    )

    setDepartments(updatedDepartments)
    setSelectedDepartment(null)
    setFormData({
      name: '',
      type: 'GOVERNMENT_AGENCY',
      budget: 0,
      address: '',
      description: ''
    })
    setIsEditDialogOpen(false)
  }

  const handleDeleteDepartment = (id: string) => {
    const updatedDepartments = departments.filter(dept => dept.id !== id)
    setDepartments(updatedDepartments)
  }

  const openEditDialog = (department: Department) => {
    setSelectedDepartment(department)
    setFormData({
      name: department.name,
      type: department.type,
      budget: department.budget,
      address: department.address || '',
      description: department.description || ''
    })
    setIsEditDialogOpen(true)
  }

  const handleExportData = () => {
    // Create CSV content
    const headers = ['Department Name', 'Type', 'Budget', 'Spent', 'Remaining', 'Transactions', 'Status', 'Created Date']
    const csvContent = [
      headers.join(','),
      ...filteredDepartments.map(dept => [
        dept.name,
        dept.type.replace('_', ' '),
        dept.budget,
        dept.spent,
        dept.budget - dept.spent,
        dept.transactions,
        dept.status,
        new Date(dept.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `departments_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0)
  const totalSpent = departments.reduce((sum, dept) => sum + dept.spent, 0)
  const totalTransactions = departments.reduce((sum, dept) => sum + dept.transactions, 0)
  const activeDepartments = departments.filter(dept => dept.status === 'ACTIVE').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading departments...</p>
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
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(departments.length)}</div>
            <p className="text-xs text-muted-foreground">
              {activeDepartments} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              Allocated budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalSpent / totalBudget) * 100).toFixed(1)}% utilization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalTransactions)}</div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Department Management</CardTitle>
              <CardDescription>Manage government agencies and their budget allocations</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Department</span>
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Department</DialogTitle>
                  <DialogDescription>Create a new government department or agency</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Department Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter department name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GOVERNMENT_AGENCY">Government Agency</SelectItem>
                        <SelectItem value="DEPARTMENT">Department</SelectItem>
                        <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                        <SelectItem value="PROJECT">Project</SelectItem>
                        <SelectItem value="CITIZEN">Citizen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget Allocation</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                      placeholder="Enter budget amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Enter department description"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddDepartment}>
                      Add Department
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="GOVERNMENT_AGENCY">Government Agency</SelectItem>
                <SelectItem value="DEPARTMENT">Department</SelectItem>
                <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                <SelectItem value="PROJECT">Project</SelectItem>
                <SelectItem value="CITIZEN">Citizen</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredDepartments.map((dept) => {
                const spentPercentage = dept.budget > 0 ? (dept.spent / dept.budget) * 100 : 0
                return (
                  <Card key={dept.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Building2 className="h-6 w-6 text-primary" />
                            <div>
                              <h3 className="font-semibold text-lg">{dept.name}</h3>
                              <p className="text-sm text-muted-foreground">{dept.description}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {getTypeBadge(dept.type)}
                            {getStatusBadge(dept.status)}
                            <Badge variant="outline" className="text-xs">
                              {dept.address?.substring(0, 10)}...
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Budget</div>
                              <div className="font-medium">{formatCurrency(dept.budget)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Spent</div>
                              <div className="font-medium">{formatCurrency(dept.spent)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Transactions</div>
                              <div className="font-medium">{formatNumber(dept.transactions)}</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Budget Utilization</span>
                              <span>{spentPercentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={spentPercentage} className="h-2" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(dept)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Department</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {dept.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteDepartment(dept.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>Update department information and budget allocation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Department Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter department name"
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GOVERNMENT_AGENCY">Government Agency</SelectItem>
                  <SelectItem value="DEPARTMENT">Department</SelectItem>
                  <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                  <SelectItem value="PROJECT">Project</SelectItem>
                  <SelectItem value="CITIZEN">Citizen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-budget">Budget Allocation</Label>
              <Input
                id="edit-budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                placeholder="Enter budget amount"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter department description"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditDepartment}>
                Update Department
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}