import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Check, X, Shield, UserCheck, User } from 'lucide-react'

interface Permission {
  category: string
  permission: string
  admin: boolean
  manager: boolean
  member: boolean
  description: string
}

const permissions: Permission[] = [
  // Project Management
  {
    category: 'Projects',
    permission: 'Create Projects',
    admin: true,
    manager: true,
    member: false,
    description: 'Create new RFP projects'
  },
  {
    category: 'Projects',
    permission: 'Edit All Projects',
    admin: true,
    manager: true,
    member: false,
    description: 'Edit any project in the system'
  },
  {
    category: 'Projects',
    permission: 'Edit Assigned Projects',
    admin: true,
    manager: true,
    member: true,
    description: 'Edit projects assigned to user'
  },
  {
    category: 'Projects',
    permission: 'Delete Projects',
    admin: true,
    manager: false,
    member: false,
    description: 'Permanently delete projects'
  },
  {
    category: 'Projects',
    permission: 'Assign Projects',
    admin: true,
    manager: true,
    member: false,
    description: 'Assign projects to team members'
  },
  {
    category: 'Projects',
    permission: 'Change Project Stage',
    admin: true,
    manager: true,
    member: true,
    description: 'Move projects between stages'
  },

  // User Management
  {
    category: 'Users',
    permission: 'View All Users',
    admin: true,
    manager: true,
    member: false,
    description: 'View all team members'
  },
  {
    category: 'Users',
    permission: 'Invite Users',
    admin: true,
    manager: false,
    member: false,
    description: 'Send invitations to new users'
  },
  {
    category: 'Users',
    permission: 'Edit User Roles',
    admin: true,
    manager: false,
    member: false,
    description: 'Change user role assignments'
  },
  {
    category: 'Users',
    permission: 'Remove Users',
    admin: true,
    manager: false,
    member: false,
    description: 'Remove users from the system'
  },

  // Tags & Categories
  {
    category: 'Tags',
    permission: 'Create Tags',
    admin: true,
    manager: true,
    member: false,
    description: 'Create new project tags'
  },
  {
    category: 'Tags',
    permission: 'Edit Tags',
    admin: true,
    manager: true,
    member: false,
    description: 'Modify existing tags'
  },
  {
    category: 'Tags',
    permission: 'Delete Tags',
    admin: true,
    manager: false,
    member: false,
    description: 'Remove tags from system'
  },

  // Comments & Communication
  {
    category: 'Comments',
    permission: 'Add Comments',
    admin: true,
    manager: true,
    member: true,
    description: 'Add comments to projects'
  },
  {
    category: 'Comments',
    permission: 'Edit Own Comments',
    admin: true,
    manager: true,
    member: true,
    description: 'Edit own comments'
  },
  {
    category: 'Comments',
    permission: 'Delete Any Comment',
    admin: true,
    manager: true,
    member: false,
    description: 'Delete any comment in the system'
  },

  // System Administration
  {
    category: 'System',
    permission: 'View Analytics',
    admin: true,
    manager: true,
    member: false,
    description: 'Access system analytics and reports'
  },
  {
    category: 'System',
    permission: 'Export Data',
    admin: true,
    manager: true,
    member: false,
    description: 'Export project and user data'
  },
  {
    category: 'System',
    permission: 'System Settings',
    admin: true,
    manager: false,
    member: false,
    description: 'Modify system configuration'
  }
]

const PermissionIcon = ({ hasPermission }: { hasPermission: boolean }) => {
  return hasPermission ? (
    <Check className="h-4 w-4 text-green-600" />
  ) : (
    <X className="h-4 w-4 text-red-400" />
  )
}

const RoleHeader = ({ role, icon: Icon, count }: { role: string; icon: any; count: number }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4" />
      <span className="font-medium">{role}</span>
    </div>
    <Badge variant="outline" className="text-xs">
      {count} permissions
    </Badge>
  </div>
)

export function RolePermissionsMatrix() {
  const categories = [...new Set(permissions.map(p => p.category))]
  
  const adminCount = permissions.filter(p => p.admin).length
  const managerCount = permissions.filter(p => p.manager).length
  const memberCount = permissions.filter(p => p.member).length

  return (
    <div className="space-y-4">
      {/* Role Summary */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <RoleHeader 
            role="Admin" 
            icon={Shield} 
            count={adminCount}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Full system access
          </p>
        </div>
        <div className="text-center">
          <RoleHeader 
            role="Manager" 
            icon={UserCheck} 
            count={managerCount}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Project oversight
          </p>
        </div>
        <div className="text-center">
          <RoleHeader 
            role="Member" 
            icon={User} 
            count={memberCount}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Basic access
          </p>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Permission</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4 text-red-500" />
                  Admin
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <UserCheck className="h-4 w-4 text-blue-500" />
                  Manager
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <User className="h-4 w-4 text-green-500" />
                  Member
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <>
                <TableRow key={`category-${category}`} className="bg-muted/30">
                  <TableCell colSpan={4} className="font-medium text-sm">
                    {category}
                  </TableCell>
                </TableRow>
                {permissions
                  .filter(p => p.category === category)
                  .map((permission) => (
                    <TableRow key={permission.permission}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {permission.permission}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {permission.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <PermissionIcon hasPermission={permission.admin} />
                      </TableCell>
                      <TableCell className="text-center">
                        <PermissionIcon hasPermission={permission.manager} />
                      </TableCell>
                      <TableCell className="text-center">
                        <PermissionIcon hasPermission={permission.member} />
                      </TableCell>
                    </TableRow>
                  ))}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          <span>Allowed</span>
        </div>
        <div className="flex items-center gap-2">
          <X className="h-4 w-4 text-red-400" />
          <span>Not Allowed</span>
        </div>
      </div>
    </div>
  )
}
