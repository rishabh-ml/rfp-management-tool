'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, 
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
  Hash as HashIcon,
  X
} from 'lucide-react'
import { toast } from 'sonner'

const attributeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  label: z.string().min(2, 'Label must be at least 2 characters').max(100, 'Label is too long'),
  type: z.enum([
    'text', 'long_text', 'number', 'date', 'checkbox', 'dropdown', 
    'label', 'checklist', 'link', 'member', 'vote', 'progress', 
    'rating', 'created_at', 'updated_at', 'created_by', 'button', 'custom_id'
  ]),
  description: z.string().optional(),
  is_required: z.boolean().default(false),
  default_value: z.string().optional(),
  options: z.array(z.string()).optional(),
  validation_rules: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional()
  }).optional()
})

type AttributeFormData = z.infer<typeof attributeSchema>

interface AttributeFormProps {
  onAttributeCreated?: (attribute: any) => void
  initialData?: Partial<AttributeFormData>
  isEditing?: boolean
}

const attributeTypes = [
  { value: 'text', label: 'Text', icon: Type, description: 'Single line text input' },
  { value: 'long_text', label: 'Long Text', icon: Type, description: 'Multi-line text area' },
  { value: 'number', label: 'Number', icon: Hash, description: 'Numeric input with validation' },
  { value: 'date', label: 'Date', icon: Calendar, description: 'Date picker with calendar' },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'True/false toggle' },
  { value: 'dropdown', label: 'Dropdown', icon: List, description: 'Select from predefined options' },
  { value: 'label', label: 'Label', icon: TagIcon, description: 'Colored category tags' },
  { value: 'checklist', label: 'Checklist', icon: CheckSquare, description: 'Multiple checkable items' },
  { value: 'link', label: 'Link', icon: LinkIcon, description: 'URL input with validation' },
  { value: 'member', label: 'Member', icon: Users, description: 'Team member assignment' },
  { value: 'vote', label: 'Vote', icon: ThumbsUp, description: 'Voting/approval system' },
  { value: 'progress', label: 'Progress', icon: BarChart3, description: 'Progress bar (0-100%)' },
  { value: 'rating', label: 'Rating', icon: Star, description: 'Star rating system' },
  { value: 'created_at', label: 'Created At', icon: Clock, description: 'Automatic creation timestamp' },
  { value: 'updated_at', label: 'Updated At', icon: Clock, description: 'Automatic update timestamp' },
  { value: 'created_by', label: 'Created By', icon: User, description: 'Automatic creator tracking' },
  { value: 'button', label: 'Button', icon: MousePointer, description: 'Interactive action button' },
  { value: 'custom_id', label: 'Custom ID', icon: HashIcon, description: 'User-defined identifier' }
]

export function AttributeForm({ onAttributeCreated, initialData, isEditing = false }: AttributeFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [options, setOptions] = useState<string[]>(initialData?.options || [])
  const [newOption, setNewOption] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<AttributeFormData>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      is_required: false,
      ...initialData
    }
  })

  const selectedType = watch('type')
  const isRequired = watch('is_required')

  const needsOptions = ['dropdown', 'checklist', 'label'].includes(selectedType)
  const isAutomatic = ['created_at', 'updated_at', 'created_by'].includes(selectedType)

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      const updatedOptions = [...options, newOption.trim()]
      setOptions(updatedOptions)
      setNewOption('')
    }
  }

  const removeOption = (optionToRemove: string) => {
    setOptions(options.filter(option => option !== optionToRemove))
  }

  const onSubmit = async (data: AttributeFormData) => {
    setIsSubmitting(true)
    try {
      const attributeData = {
        ...data,
        options: needsOptions ? options : undefined,
        name: data.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      }

      const response = await fetch('/api/custom-attributes', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attributeData)
      })

      if (!response.ok) {
        throw new Error('Failed to save custom attribute')
      }

      const attribute = await response.json()
      
      toast.success(`Custom attribute ${isEditing ? 'updated' : 'created'} successfully!`)
      onAttributeCreated?.(attribute)
      setIsOpen(false)
      reset()
      setOptions([])
    } catch (error) {
      console.error('Error saving custom attribute:', error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} custom attribute`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = attributeTypes.find(t => t.value === type)
    return typeConfig?.icon || Type
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Attribute
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Attribute</DialogTitle>
          <DialogDescription>
            Add a custom field to capture additional project information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="label">Display Label *</Label>
              <Input
                id="label"
                {...register('label')}
                placeholder="e.g., Client Industry"
                disabled={isSubmitting}
              />
              {errors.label && (
                <p className="text-sm text-destructive">{errors.label.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Field Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., client_industry"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Used internally (lowercase, underscores only)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe what this field is used for"
              rows={2}
              disabled={isSubmitting}
            />
          </div>

          {/* Attribute Type */}
          <div className="space-y-2">
            <Label>Attribute Type *</Label>
            <Select value={selectedType} onValueChange={(value) => setValue('type', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select attribute type" />
              </SelectTrigger>
              <SelectContent>
                {attributeTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Type-specific Configuration */}
          {needsOptions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Options</CardTitle>
                <CardDescription>
                  Define the available options for this {selectedType}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Enter option"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                  />
                  <Button type="button" onClick={addOption} size="sm">
                    Add
                  </Button>
                </div>
                
                {options.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Current Options:</Label>
                    <div className="flex flex-wrap gap-2">
                      {options.map((option, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {option}
                          <button
                            type="button"
                            onClick={() => removeOption(option)}
                            className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Required Field</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must provide a value for this field
                  </p>
                </div>
                <Switch
                  checked={isRequired}
                  onCheckedChange={(checked) => setValue('is_required', checked)}
                  disabled={isAutomatic}
                />
              </div>

              {!isAutomatic && (
                <div className="space-y-2">
                  <Label htmlFor="default_value">Default Value</Label>
                  <Input
                    id="default_value"
                    {...register('default_value')}
                    placeholder="Optional default value"
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
              {isEditing ? 'Update' : 'Create'} Attribute
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
