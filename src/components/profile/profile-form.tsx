'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Bell, 
  Shield, 
  Mail,
  Phone,
  MapPin,
  Save,
  Upload,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import type { User as UserType } from '@/lib/types'

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  timezone: z.string().optional()
})

const notificationSchema = z.object({
  email_notifications: z.boolean(),
  project_assignments: z.boolean(),
  due_date_reminders: z.boolean(),
  comment_mentions: z.boolean(),
  weekly_summary: z.boolean(),
  notification_frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']),
  quiet_hours_start: z.string().optional(),
  quiet_hours_end: z.string().optional()
})

type ProfileFormData = z.infer<typeof profileSchema>
type NotificationFormData = z.infer<typeof notificationSchema>

interface ProfileFormProps {
  user: UserType
  preferences?: any
}

export function ProfileForm({ user, preferences }: ProfileFormProps) {
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false)
  const [isSubmittingNotifications, setIsSubmittingNotifications] = useState(false)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email,
      phone: '',
      location: '',
      bio: '',
      timezone: 'UTC'
    }
  })

  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email_notifications: preferences?.email_notifications ?? true,
      project_assignments: preferences?.project_assignments ?? true,
      due_date_reminders: preferences?.due_date_reminders ?? true,
      comment_mentions: preferences?.comment_mentions ?? true,
      weekly_summary: preferences?.weekly_summary ?? false,
      notification_frequency: preferences?.notification_frequency ?? 'immediate',
      quiet_hours_start: preferences?.quiet_hours_start ?? '22:00',
      quiet_hours_end: preferences?.quiet_hours_end ?? '08:00'
    }
  })

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsSubmittingProfile(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      toast.success(result.message || 'Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
      
      // Show specific error messages for common issues
      if (errorMessage.includes('relation') || errorMessage.includes('table')) {
        toast.error('Database not initialized. Please run the setup scripts first.')
      } else if (errorMessage.includes('Unauthorized')) {
        toast.error('You need to be signed in to update your profile')
      } else {
        toast.error(`Failed to update profile: ${errorMessage}`)
      }
    } finally {
      setIsSubmittingProfile(false)
    }
  }

  const onSubmitNotifications = async (data: NotificationFormData) => {
    setIsSubmittingNotifications(true)
    try {
      console.log('Submitting notification preferences:', data)
      
      const response = await fetch('/api/profile/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      console.log('Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log('Error response data:', errorData)
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Success response:', result)
      toast.success(result.message || 'Notification preferences updated!')
    } catch (error) {
      console.error('Error updating preferences:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences'
      
      // Show specific error messages for common issues
      if (errorMessage.includes('relation') || errorMessage.includes('table')) {
        toast.error('Database not initialized. Please run the setup scripts first.')
      } else if (errorMessage.includes('Unauthorized')) {
        toast.error('You need to be signed in to update preferences')
      } else {
        toast.error(`Failed to update preferences: ${errorMessage}`)
      }
    } finally {
      setIsSubmittingNotifications(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and profile details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <UserAvatar user={user} size="lg" />
              <div className="space-y-2">
                <Button variant="outline" size="sm" type="button">
                  <Upload className="mr-2 h-4 w-4" />
                  Change Avatar
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>

            <Separator />

            {/* Basic Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input 
                  id="first_name" 
                  {...profileForm.register('first_name')}
                  disabled={isSubmittingProfile}
                />
                {profileForm.formState.errors.first_name && (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.first_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input 
                  id="last_name" 
                  {...profileForm.register('last_name')}
                  disabled={isSubmittingProfile}
                />
                {profileForm.formState.errors.last_name && (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input 
                id="email" 
                type="email" 
                {...profileForm.register('email')}
                disabled={true} // Email managed by Clerk
              />
              <p className="text-xs text-muted-foreground">
                Email is managed by your authentication provider
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  {...profileForm.register('phone')}
                  placeholder="Enter your phone number"
                  disabled={isSubmittingProfile}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  {...profileForm.register('location')}
                  placeholder="City, Country"
                  disabled={isSubmittingProfile}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                {...profileForm.register('bio')}
                placeholder="Tell us about yourself..."
                rows={3}
                disabled={isSubmittingProfile}
              />
              {profileForm.formState.errors.bio && (
                <p className="text-sm text-destructive">
                  {profileForm.formState.errors.bio.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={profileForm.watch('timezone')} 
                onValueChange={(value) => profileForm.setValue('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Information */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">Current Role</div>
                <div className="text-sm text-muted-foreground">
                  Your access level and permissions
                </div>
              </div>
              <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmittingProfile}>
              {isSubmittingProfile && <LoadingSpinner size="sm" className="mr-2" />}
              <Save className="mr-2 h-4 w-4" />
              Save Profile Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified about important updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={notificationForm.handleSubmit(onSubmitNotifications)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Email Notifications</div>
                  <div className="text-xs text-muted-foreground">
                    Receive email updates about project changes
                  </div>
                </div>
                <Switch 
                  checked={notificationForm.watch('email_notifications')}
                  onCheckedChange={(checked) => notificationForm.setValue('email_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Project Assignments</div>
                  <div className="text-xs text-muted-foreground">
                    Get notified when you&apos;re assigned to a project
                  </div>
                </div>
                <Switch 
                  checked={notificationForm.watch('project_assignments')}
                  onCheckedChange={(checked) => notificationForm.setValue('project_assignments', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Due Date Reminders</div>
                  <div className="text-xs text-muted-foreground">
                    Receive reminders before project deadlines
                  </div>
                </div>
                <Switch 
                  checked={notificationForm.watch('due_date_reminders')}
                  onCheckedChange={(checked) => notificationForm.setValue('due_date_reminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Comment Mentions</div>
                  <div className="text-xs text-muted-foreground">
                    Get notified when someone mentions you in comments
                  </div>
                </div>
                <Switch 
                  checked={notificationForm.watch('comment_mentions')}
                  onCheckedChange={(checked) => notificationForm.setValue('comment_mentions', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Weekly Summary</div>
                  <div className="text-xs text-muted-foreground">
                    Receive a weekly summary of your projects
                  </div>
                </div>
                <Switch 
                  checked={notificationForm.watch('weekly_summary')}
                  onCheckedChange={(checked) => notificationForm.setValue('weekly_summary', checked)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmittingNotifications}>
              {isSubmittingNotifications && <LoadingSpinner size="sm" className="mr-2" />}
              <Save className="mr-2 h-4 w-4" />
              Save Notification Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
