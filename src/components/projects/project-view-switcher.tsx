import { ProjectService } from '@/lib/services/project-service'
import { ProjectViewClient } from './project-view-client'

export async function ProjectViewSwitcher() {
  const projects = await ProjectService.getProjects()

  return <ProjectViewClient projects={projects} />
}


