import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Type, 
  Calendar, 
  Hash, 
  CheckSquare, 
  List, 
  Tag as TagIcon, 
  Link as LinkIcon,
  Users,
  ThumbsUp,
  BarChart3,
  Star,
  Clock,
  User,
  MousePointer,
  Hash as HashIcon
} from 'lucide-react'

// Mock data removed for production

const getTypeIcon = (type: string) => {
  const icons = {
    text: Type,
    long_text: Type,
    number: Hash,
    date: Calendar,
    checkbox: CheckSquare,
    dropdown: List,
    label: TagIcon,
    checklist: CheckSquare,
    link: LinkIcon,
    member: Users,
    vote: ThumbsUp,
    progress: BarChart3,
    rating: Star,
    created_at: Clock,
    updated_at: Clock,
    created_by: User,
    button: MousePointer,
    custom_id: HashIcon
  }
  return icons[type as keyof typeof icons] || Type
}

const getTypeBadgeColor = (type: string) => {
  const colors = {
    text: 'bg-blue-100 text-blue-800',
    long_text: 'bg-blue-100 text-blue-800',
    number: 'bg-green-100 text-green-800',
    date: 'bg-purple-100 text-purple-800',
    checkbox: 'bg-orange-100 text-orange-800',
    dropdown: 'bg-indigo-100 text-indigo-800',
    label: 'bg-pink-100 text-pink-800',
    checklist: 'bg-orange-100 text-orange-800',
    link: 'bg-cyan-100 text-cyan-800',
    member: 'bg-violet-100 text-violet-800',
    vote: 'bg-rose-100 text-rose-800',
    progress: 'bg-emerald-100 text-emerald-800',
    rating: 'bg-yellow-100 text-yellow-800',
    created_at: 'bg-gray-100 text-gray-800',
    updated_at: 'bg-gray-100 text-gray-800',
    created_by: 'bg-gray-100 text-gray-800',
    button: 'bg-red-100 text-red-800',
    custom_id: 'bg-slate-100 text-slate-800'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export async function AttributesList() {
  // Fetch attributes from API
  let attributes: any[] = []

  try {
    const response = await fetch('/api/custom-attributes')
    if (response.ok) {
      attributes = await response.json()
    }
  } catch (error) {
    console.error('Error fetching attributes:', error)
  }

  const handleToggleActive = async (attributeId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/custom-attributes/${attributeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
      })
      if (!response.ok) {
        throw new Error('Failed to update attribute')
      }
    } catch (error) {
      console.error('Error toggling attribute:', error)
    }
  }

  const handleEdit = (attributeId: string) => {
    // Edit functionality would be implemented with a modal or navigation
    console.log('Edit attribute:', attributeId)
  }

  const handleDelete = async (attributeId: string) => {
    if (!confirm('Are you sure you want to delete this attribute?')) return

    try {
      const response = await fetch(`/api/custom-attributes/${attributeId}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error('Failed to delete attribute')
      }
    } catch (error) {
      console.error('Error deleting attribute:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attribute</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributes.map((attribute) => {
              const Icon = getTypeIcon(attribute.type)
              
              return (
                <TableRow key={attribute.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{attribute.label}</span>
                        {attribute.is_required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {attribute.description}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {attribute.name}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <Badge 
                        variant="secondary" 
                        className={getTypeBadgeColor(attribute.type)}
                      >
                        {attribute.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">{attribute.usage_count}</span>
                      <span className="text-muted-foreground"> projects</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={attribute.is_active}
                        onCheckedChange={(checked) => handleToggleActive(attribute.id, checked)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {attribute.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(attribute.created_at).toLocaleDateString()}
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(attribute.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Attribute
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleActive(attribute.id, !attribute.is_active)}
                        >
                          {attribute.is_active ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(attribute.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {attributes.length} custom attributes
        </div>
        <div className="flex items-center gap-4">
          <span>{attributes.filter(a => a.is_active).length} active</span>
          <span>{attributes.filter(a => a.is_required).length} required</span>
        </div>
      </div>
    </div>
  )
}
