import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ProfileForm } from '@/components/profile/profile-form'
import { UserService } from '@/lib/services/user-service'
// Settings import removed - not used in this component



async function ProfileFormWrapper() {
  const currentUser = await UserService.getCurrentUser()

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to load profile information</p>
      </div>
    )
  }

  return <ProfileForm user={currentUser} />
}

export default function ProfilePage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <Suspense fallback={<LoadingSpinner text="Loading profile..." />}>
        <ProfileFormWrapper />
      </Suspense>
    </div>
  )
}
