import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export interface Comment {
  id: number
  content: string
  created_at: string
  updated_at: string
  user_id: string
  grant_id: number
  parent_comment_id: number | null
  user_details?: {
    email: string
  }
}

interface CommentSectionProps {
  grantId: number
}

export default function CommentSection({ grantId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<number | null>(null)

  useEffect(() => {
    fetchComments()
  }, [grantId])

  async function fetchComments() {
    try {
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          *,
          user_details:auth.users(email)
        `)
        .eq('grant_id', grantId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Type assertion to handle the Supabase response
      const typedData = commentsData as unknown as Comment[]
      setComments(typedData || [])
    } catch (err) {
      console.error('Error fetching comments:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while fetching comments')
    } finally {
      setLoading(false)
    }
  }

  async function addComment(parentId: number | null = null) {
    if (!newComment.trim()) return

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          grant_id: grantId,
          parent_comment_id: parentId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })

      if (error) throw error

      setNewComment('')
      setReplyTo(null)
      await fetchComments()
    } catch (err) {
      console.error('Error adding comment:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while adding the comment')
    }
  }

  async function deleteComment(commentId: number) {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      await fetchComments()
    } catch (err) {
      console.error('Error deleting comment:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the comment')
    }
  }

  function getCommentReplies(parentId: number | null = null) {
    return comments.filter(comment => comment.parent_comment_id === parentId)
  }

  function renderComment(comment: Comment, depth: number = 0) {
    const replies = getCommentReplies(comment.id)
    const maxDepth = 3 // Maximum nesting level

    return (
      <div key={comment.id} className={`ml-${depth * 4}`}>
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {comment.user_details?.email || 'Anonymous'}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(comment.created_at).toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => deleteComment(comment.id)}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Delete comment</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-700">{comment.content}</p>
          {depth < maxDepth && (
            <div className="mt-4">
              {replyTo === comment.id ? (
                <div className="mt-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    rows={3}
                    placeholder="Write a reply..."
                  />
                  <div className="mt-3 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewComment('')
                        setReplyTo(null)
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => addComment(comment.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setReplyTo(comment.id)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Reply
                </button>
              )}
            </div>
          )}
        </div>
        {replies.length > 0 && (
          <div className="ml-4">
            {replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">Comments</h2>
          <div className="mt-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              rows={3}
              placeholder="Write a comment..."
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => addComment(null)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Comment
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="mt-8 space-y-4">
            {getCommentReplies(null).map(comment => renderComment(comment))}
          </div>
        </div>
      </div>
    </div>
  )
} 