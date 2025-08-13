'use client'

import { useState } from 'react'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatRelativeDate, getUserDisplayName } from '@/lib/utils'
import { 
  MoreHorizontal, 
  Search, 
  Shield, 
  UserCheck, 
  User, 
  UserX,
  UserPlus,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import type { User as UserType } from '@/lib/types'

interface EnhancedMembersTableProps {
  users: UserType[]
  currentUser: UserType
}

export function EnhancedMembersTable({ users, currentUser }: EnhancedMembersTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />
      case 'manager':
        return <UserCheck className="h-4 w-4 text-blue-500" />
      case 'member':
        return <User className="h-4 w-4 text-green-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive' as const
      case 'manager':
        return 'default' as const
      case 'member':
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }

  const canEditUser = (user: UserType) => {
    if (currentUser.role === 'admin') return true
    if (currentUser.role === 'manager' && user.role === 'member') return true
    return false
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        throw new Error('Failed to update user role')
      }

      toast.success('User role updated successfully')
      // Refresh the page or update local state
      window.location.reload()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/deactivate`, {
        method: 'PUT'
      })

      if (!response.ok) {
        throw new Error('Failed to deactivate user')
      }

      toast.success('User deactivated successfully')
      setIsDeactivateDialogOpen(false)
      setSelectedUser(null)
      // Refresh the page or update local state
      window.location.reload()
    } catch (error) {
      console.error('Error deactivating user:', error)
      toast.error('Failed to deactivate user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivateUser = async (userId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/reactivate`, {
        method: 'PUT'
      })

      if (!response.ok) {
        throw new Error('Failed to reactivate user')
      }

      toast.success('User reactivated successfully')
      // Refresh the page or update local state
      window.location.reload()
    } catch (error) {
      console.error('Error reactivating user:', error)
      toast.error('Failed to reactivate user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} members
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <User className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No members found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} size="sm" />
                      <div>
                        <div className="font-medium">
                          {getUserDisplayName(user)}
                          {user.id === currentUser.id && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeDate(user.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeDate(user.updated_at)}
                  </TableCell>
                  <TableCell>
                    {canEditUser(user) && user.id !== currentUser.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {/* Role change options */}
                          {currentUser.role === 'admin' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(user.id, 'admin')}
                                disabled={user.role === 'admin' || isLoading}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(user.id, 'manager')}
                                disabled={user.role === 'manager' || isLoading}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Make Manager
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(user.id, 'member')}
                                disabled={user.role === 'member' || isLoading}
                              >
                                <User className="mr-2 h-4 w-4" />
                                Make Member
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          
                          {/* Status actions */}
                          {user.is_active ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setIsDeactivateDialogOpen(true)
                              }}
                              className="text-red-600"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleReactivateUser(user.id)}
                              disabled={isLoading}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Deactivate User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate {selectedUser && getUserDisplayName(selectedUser)}? 
              They will lose access to the system but their data will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeactivateDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedUser && handleDeactivateUser(selectedUser.id)}
              disabled={isLoading}
            >
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              Deactivate User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
