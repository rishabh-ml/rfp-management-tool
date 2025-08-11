import { Sidebar } from '@/components/layout/sidebar'
import { NotificationCenter } from '@/components/notifications/notification-center'
import { RealtimeStatus } from '@/components/realtime/realtime-status'
import { UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Search, Settings } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              {/* Search could go here */}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <RealtimeStatus />
              <NotificationCenter />
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
