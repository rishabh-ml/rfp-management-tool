import { ProjectService } from '@/lib/services/project-service'
import { UserService } from '@/lib/services/user-service'
import { TagService } from '@/lib/services/tag-service'
import { ProjectViewClient } from './project-view-client'

export async function ProjectViewSwitcher() {
  const [projects, users, tags] = await Promise.all([
    ProjectService.getProjects(),
  UserService.getAllUsers(),
    TagService.getTags()
  ])

  return <ProjectViewClient projects={projects} users={users} tags={tags} />
}


