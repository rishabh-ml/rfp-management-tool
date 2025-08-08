import { ProjectService } from '@/lib/services/project-service'
import { UserService } from '@/lib/services/user-service'
import { KanbanBoardClient } from './kanban-board-client'

export async function KanbanBoard() {
  // TODO: Add proper error handling
  const [projectsByStage, currentUser] = await Promise.all([
    ProjectService.getProjectsByStage(),
    UserService.getCurrentUser()
  ])

  return (
    <KanbanBoardClient 
      initialProjects={projectsByStage}
      currentUser={currentUser}
    />
  )
}
