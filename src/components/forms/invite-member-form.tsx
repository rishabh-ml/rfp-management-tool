'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { UserPlus, Mail, Shield, UserCheck, User, X } from 'lucide-react'
import { toast } from 'sonner'

const inviteSchema = z.object({
  emails: z.string().min(1, 'At least one email is required'),
  role: z.enum(['admin', 'manager', 'member']),
  message: z.string().optional()
})

type InviteFormData = z.infer<typeof inviteSchema>

interface InviteMemberFormProps {
  onInvitesSent?: (invites: any[]) => void
}

export function InviteMemberForm({ onInvitesSent }: InviteMemberFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailList, setEmailList] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: 'member',
      message: 'You have been invited to join our RFP Management platform. Please click the link below to create your account and get started.'
    }
  })

  const selectedRole = watch('role')

  const handleEmailsChange = (value: string) => {
    setValue('emails', value)
    // Parse emails from the input
    const emails = value
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0)
    setEmailList(emails)
  }

  const removeEmail = (emailToRemove: string) => {
    const updatedEmails = emailList.filter(email => email !== emailToRemove)
    setEmailList(updatedEmails)
    setValue('emails', updatedEmails.join(', '))
  }

  const onSubmit = async (data: InviteFormData) => {
    setIsSubmitting(true)
    try {
      const emails = data.emails
        .split(/[,\n]/)
        .map(email => email.trim())
        .filter(email => email.length > 0)

      if (emails.length === 0) {
        toast.error('Please enter at least one email address')
        return
      }

      // Validate email formats
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const invalidEmails = emails.filter(email => !emailRegex.test(email))
      
      if (invalidEmails.length > 0) {
        toast.error(`Invalid email addresses: ${invalidEmails.join(', ')}`)
        return
      }

      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails,
          role: data.role,
          message: data.message
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send invitations')
      }

      const result = await response.json()
      
      toast.success(`Successfully sent ${emails.length} invitation${emails.length > 1 ? 's' : ''}!`)
      onInvitesSent?.(result.invitations)
      setIsOpen(false)
      reset()
      setEmailList([])
    } catch (error) {
      console.error('Error sending invitations:', error)
      toast.error('Failed to send invitations. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full system access including user management and system settings'
      case 'manager':
        return 'Project oversight with team coordination and reporting capabilities'
      case 'member':
        return 'Project contribution with access to assigned projects and tasks'
      default:
        return ''
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Members
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite Team Members
          </DialogTitle>
          <DialogDescription>
            Send invitations to new team members to join your RFP management workspace
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Addresses */}
          <div className="space-y-2">
            <Label htmlFor="emails">Email Addresses *</Label>
            <Textarea
              id="emails"
              {...register('emails')}
              placeholder="Enter email addresses separated by commas or new lines&#10;example@company.com, another@company.com"
              rows={4}
              onChange={(e) => handleEmailsChange(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.emails && (
              <p className="text-sm text-destructive">{errors.emails.message}</p>
            )}
            
            {/* Email Preview */}
            {emailList.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  {emailList.length} email{emailList.length > 1 ? 's' : ''} to invite:
                </Label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {emailList.map((email, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {email}
                      <button
                        type="button"
                        onClick={() => removeEmail(email)}
                        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={selectedRole} onValueChange={(value) => setValue('role', value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-500" />
                    Member
                  </div>
                </SelectItem>
                <SelectItem value="manager">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-500" />
                    Manager
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-500" />
                    Administrator
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {/* Role Description */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  {getRoleIcon(selectedRole)}
                  <div>
                    <p className="font-medium text-sm capitalize">{selectedRole} Permissions</p>
                    <p className="text-xs text-muted-foreground">
                      {getRoleDescription(selectedRole)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Add a personal message to the invitation email..."
              rows={3}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              This message will be included in the invitation email
            </p>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || emailList.length === 0}>
              {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
              Send {emailList.length > 0 ? `${emailList.length} ` : ''}Invitation{emailList.length > 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
