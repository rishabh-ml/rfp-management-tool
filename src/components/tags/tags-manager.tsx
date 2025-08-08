import { TagService } from '@/lib/services/tag-service'
import { UserService } from '@/lib/services/user-service'
import { TagsManagerClient } from './tags-manager-client'

export async function TagsManager() {
  // TODO: Add proper error handling
  const [tags, currentUser] = await Promise.all([
    TagService.getTags(),
    UserService.getCurrentUser()
  ])

  return (
    <TagsManagerClient 
      initialTags={tags}
      currentUser={currentUser}
    />
  )
}
