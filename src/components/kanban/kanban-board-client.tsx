'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KANBAN_COLUMNS } from '@/lib/constants'
import type { ProjectWithDetails, ProjectStage, User } from '@/lib/types'
import { toast } from 'sonner'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'

interface KanbanBoardClientProps {
  initialProjects: Record<ProjectStage, ProjectWithDetails[]>
  currentUser: User | null
}

export function KanbanBoardClient({ initialProjects, currentUser }: KanbanBoardClientProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [activeProject, setActiveProject] = useState<ProjectWithDetails | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const project = findProject(active.id as string)
    setActiveProject(project)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveProject(null)

    if (!over) return

    const projectId = active.id as string
    const newStage = over.id as ProjectStage
    
    const project = findProject(projectId)
    if (!project || project.stage === newStage) return

    // Optimistic update
    const oldStage = project.stage
    updateProjectStageLocally(projectId, oldStage, newStage)

    try {
      // Make API call to update project stage
      const response = await fetch('/api/projects/update-stage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          newStage,
          userId: currentUser?.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update project stage')
      }

      toast.success(`Project moved to ${newStage.replace('_', ' ')}`)
    } catch (error) {
      // Revert on error
      updateProjectStageLocally(projectId, newStage, oldStage)
      toast.error('Failed to update project stage')
      console.error('Error updating project stage:', error)
    }
  }

  const findProject = (projectId: string): ProjectWithDetails | null => {
    for (const stage of Object.keys(projects) as ProjectStage[]) {
      const project = projects[stage].find(p => p.id === projectId)
      if (project) return project
    }
    return null
  }

  const updateProjectStageLocally = (projectId: string, fromStage: ProjectStage, toStage: ProjectStage) => {
    setProjects(prev => {
      const project = prev[fromStage].find(p => p.id === projectId)
      if (!project) return prev

      const updatedProject = { ...project, stage: toStage }

      return {
        ...prev,
        [fromStage]: prev[fromStage].filter(p => p.id !== projectId),
        [toStage]: [...prev[toStage], updatedProject]
      }
    })
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <SortableContext
              items={projects[column.id].map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                column={{
                  ...column,
                  projects: projects[column.id]
                }}
              />
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeProject ? (
          <div className="rotate-3 opacity-90">
            <KanbanCard project={activeProject} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
