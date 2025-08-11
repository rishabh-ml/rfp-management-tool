import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// Badge import removed - not used in this component
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { UserService } from '@/lib/services/user-service'
import { Users, Plus, Shield, UserCheck, Settings } from 'lucide-react'
// Link import removed - not used in this component
import { MembersTable } from '@/components/members/members-table'
import { RolePermissionsMatrix } from '@/components/members/role-permissions-matrix'

async function MembersStats() {
  const users = await UserService.getAllUsers()
  
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    members: users.filter(u => u.role === 'member').length,
    active: users.length // TODO: Add active status tracking
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.active} active users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Administrators</CardTitle>
          <Shield className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
          <p className="text-xs text-muted-foreground">
            Full system access
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Managers</CardTitle>
          <UserCheck className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.managers}</div>
          <p className="text-xs text-muted-foreground">
            Project oversight
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          <Users className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.members}</div>
          <p className="text-xs text-muted-foreground">
            Project contributors
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MembersPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members & Roles</h1>
          <p className="text-muted-foreground">
            Manage team members, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Role Settings
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Suspense fallback={<LoadingSpinner text="Loading member statistics..." />}>
        <MembersStats />
      </Suspense>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingSpinner text="Loading members..." />}>
            <MembersTable />
          </Suspense>
        </CardContent>
      </Card>

      {/* Role Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Overview of permissions for each role level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RolePermissionsMatrix />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bulk Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              Export Member List
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              Import Members
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              Send Bulk Invitations
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              View Audit Log
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              Manage API Keys
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              Security Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              User Activity Report
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              Permission Changes
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              Login Statistics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
