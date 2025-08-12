import { NextRequest, NextResponse } from 'next/server'
import { ProjectService } from '@/lib/services/project-service'
import { UserService } from '@/lib/services/user-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await UserService.getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the project
    const project = await ProjectService.getProjectById(id)
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Create HTML content for export
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Project Report: ${project.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            h2 { color: #666; margin-top: 30px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .info-item { margin: 10px 0; }
            .label { font-weight: bold; }
            .subtask { margin: 5px 0; padding-left: 20px; }
            .comment { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <h1>Project Report: ${project.title}</h1>
          
          <div class="info-item">
            <span class="label">Description:</span> ${project.description || 'No description provided'}
          </div>
          
          <div class="info-grid">
            <div>
              <div class="info-item"><span class="label">Stage:</span> ${project.stage}</div>
              <div class="info-item"><span class="label">Priority:</span> ${project.priority}</div>
              <div class="info-item"><span class="label">Progress:</span> ${project.progress_percentage || 0}%</div>
              ${project.due_date ? `<div class="info-item"><span class="label">Due Date:</span> ${new Date(project.due_date).toLocaleDateString()}</div>` : ''}
            </div>
            <div>
              ${project.owner ? `<div class="info-item"><span class="label">Assigned To:</span> ${project.owner.first_name} ${project.owner.last_name}</div>` : ''}
              ${project.budget_amount ? `<div class="info-item"><span class="label">Budget:</span> $${project.budget_amount.toLocaleString()}</div>` : ''}
              ${project.estimated_hours ? `<div class="info-item"><span class="label">Estimated Hours:</span> ${project.estimated_hours}</div>` : ''}
              ${project.client_name ? `<div class="info-item"><span class="label">Client:</span> ${project.client_name}</div>` : ''}
            </div>
          </div>

          <div class="info-item">
            <span class="label">Created:</span> ${new Date(project.created_at).toLocaleDateString()}
          </div>
          <div class="info-item">
            <span class="label">Last Updated:</span> ${new Date(project.updated_at).toLocaleDateString()}
          </div>

          ${project.subtasks && project.subtasks.length > 0 ? `
            <h2>Subtasks (${project.subtasks.length})</h2>
            ${project.subtasks.map((subtask: any, index: number) => 
              `<div class="subtask">${index + 1}. ${subtask.title} - ${subtask.priority} priority${subtask.status ? ` (${subtask.status})` : ''}</div>`
            ).join('')}
          ` : ''}

          ${project.comments && project.comments.length > 0 ? `
            <h2>Comments (${project.comments.length})</h2>
            ${project.comments.map((comment: any) => 
              `<div class="comment">
                <div>${comment.content}</div>
                <small>By: ${comment.user?.first_name} ${comment.user?.last_name} on ${new Date(comment.created_at).toLocaleDateString()}</small>
              </div>`
            ).join('')}
          ` : ''}

          ${project.tags && project.tags.length > 0 ? `
            <h2>Tags</h2>
            <div>${project.tags.map((tag: any) => `<span style="background: ${tag.color}; color: white; padding: 2px 8px; border-radius: 3px; margin-right: 5px;">${tag.name}</span>`).join('')}</div>
          ` : ''}
        </body>
      </html>
    `

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${project.title.replace(/[^a-zA-Z0-9]/g, '-')}-report.html"`
      }
    })

  } catch (error) {
    console.error('Error exporting project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
