'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { UserAvatar } from '@/components/ui/user-avatar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatRelativeDate, getUserDisplayName } from '@/lib/utils'
import type { CommentWithUser, User } from '@/lib/types'
import { MessageSquare, Send } from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(5000, 'Comment is too long')
})

type CommentFormData = z.infer<typeof commentSchema>

interface CommentsSectionProps {
  projectId: string
  comments: CommentWithUser[]
  currentUser: User | null
  onCommentAdded?: (comment: CommentWithUser) => void
}

export function CommentsSection({ 
  projectId, 
  comments: initialComments, 
  currentUser,
  onCommentAdded 
}: CommentsSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema)
  })

  const onSubmit = async (data: CommentFormData) => {
    if (!currentUser) {
      toast.error('You must be logged in to comment')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          content: data.content,
          userId: currentUser.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      const newComment = await response.json()
      
      // Add the new comment to the list
      const commentWithUser: CommentWithUser = {
        ...newComment,
        user: currentUser
      }
      
      setComments(prev => [...prev, commentWithUser])
      onCommentAdded?.(commentWithUser)
      reset()
      toast.success('Comment added successfully!')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {currentUser && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-3">
              <UserAvatar user={currentUser} size="sm" />
              <div className="flex-1 space-y-2">
                <Textarea
                  {...register('content')}
                  placeholder="Add a comment... (Markdown supported)"
                  rows={3}
                  disabled={isSubmitting}
                  className="resize-none"
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Supports Markdown formatting
                  </p>
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
                    <Send className="h-4 w-4 mr-2" />
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No comments yet.</p>
            {currentUser && (
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to add one!
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <UserAvatar user={comment.user} size="sm" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {getUserDisplayName(comment.user)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeDate(comment.created_at)}
                    </span>
                    {comment.updated_at !== comment.created_at && (
                      <span className="text-xs text-muted-foreground">
                        (edited)
                      </span>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        // Customize markdown rendering
                        p: ({ children }) => <p className="text-sm text-foreground mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        code: ({ children }) => (
                          <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs">
                            {children}
                          </pre>
                        ),
                        ul: ({ children }) => <ul className="list-disc list-inside text-sm space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside text-sm space-y-1">{children}</ol>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-muted-foreground pl-4 italic text-sm">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {comment.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
