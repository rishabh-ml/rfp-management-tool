'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Tag } from '@/components/ui/tag'
import type { TagWithCreator, User } from '@/lib/types'
import { Tags as TagsIcon } from 'lucide-react'

interface TagsManagerClientProps {
  initialTags: TagWithCreator[]
  currentUser: User | null
}

export function TagsManagerClient({ initialTags }: TagsManagerClientProps) {
  // TODO: Implement full CRUD functionality
  
  if (initialTags.length === 0) {
    return (
      <EmptyState
        icon={<TagsIcon className="h-8 w-8 text-muted-foreground" />}
        title="No tags yet"
        description="Create your first tag to get started"
      />
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {initialTags.map((tag) => (
        <Card key={tag.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Tag tag={tag} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {tag.creator && (
                <p>Created by {tag.creator.first_name} {tag.creator.last_name}</p>
              )}
              <p>Created {new Date(tag.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
