import { useState } from 'react';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon, ChatBubbleOvalLeftIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Post, Comment } from '../types';
import { likePost, unlikePost, addComment, deletePost } from '../services/post.service';
import CommentForm from './CommentForm';

interface PostItemProps {
  post: Post;
  currentUserId: string;
}

const PostItem = ({ post, currentUserId }: PostItemProps) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.likedBy?.includes(currentUserId) || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const isAuthor = post.userId === currentUserId;
  
  const handleLikeToggle = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      if (isLiked) {
        await unlikePost(post.id, currentUserId);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await likePost(post.id, currentUserId);
        setLikeCount(prev => prev + 1);
      }
      
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      setError('Failed to update like status');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddComment = async (content: string) => {
    if (loading || !content.trim()) return;
    
    try {
      setLoading(true);
      
      const newComment = await addComment(post.id, currentUserId, content);
      
      setComments(prev => [...prev, newComment]);
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeletePost = async () => {
    if (!isAuthor || loading) return;
    
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      await deletePost(post.id, currentUserId);
      
      // Post is deleted, we could remove it from the UI, 
      // but we'd need the parent component to handle this
      // For now, we'll just show a message
      setError('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${post.userId}`} className="flex-shrink-0">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={post.userPhotoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.displayName)}
              alt={post.displayName}
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/profile/${post.userId}`} className="text-sm font-medium text-gray-900 hover:underline">
              {post.displayName}
            </Link>
            <p className="text-xs text-gray-500">
              {post.createdAt && format(new Date(post.createdAt.toDate()), 'MMM d, yyyy h:mm a')}
              &nbsp;•&nbsp;
              <span className="capitalize">{post.userRole}</span>
            </p>
          </div>
          
          {isAuthor && (
            <div className="flex space-x-2">
              <button
                onClick={handleDeletePost}
                disabled={loading}
                className="text-gray-400 hover:text-red-500"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-3">
          <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
        </div>
        
        {post.mediaURL && (
          <div className="mt-4">
            {post.mediaType === 'image' ? (
              <img
                src={post.mediaURL}
                alt="Post attachment"
                className="w-full max-h-96 object-contain rounded-lg"
              />
            ) : post.mediaType === 'video' ? (
              <video
                src={post.mediaURL}
                controls
                className="w-full max-h-96 rounded-lg"
              />
            ) : null}
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={handleLikeToggle}
              disabled={loading}
            >
              {isLiked ? (
                <HeartIconSolid className="h-5 w-5" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
              <span>{likeCount}</span>
            </button>
            
            <button 
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
              onClick={() => setShowComments(!showComments)}
            >
              <ChatBubbleOvalLeftIcon className="h-5 w-5" />
              <span>{comments.length}</span>
            </button>
          </div>
        </div>
      </div>
      
      {showComments && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {comments.length > 0 ? (
            <div className="space-y-4 mb-4">
              {comments.map((comment: Comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Link to={`/profile/${comment.userId}`} className="flex-shrink-0">
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={comment.userPhotoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.displayName)}
                      alt={comment.displayName}
                    />
                  </Link>
                  <div className="flex-1 bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <Link to={`/profile/${comment.userId}`} className="text-sm font-medium text-gray-900 hover:underline">
                        {comment.displayName}
                      </Link>
                      <span className="text-xs text-gray-500">
                        {comment.createdAt && format(new Date(comment.createdAt.toDate()), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-800">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-4 text-center">No comments yet</p>
          )}
          
          <CommentForm onSubmit={handleAddComment} loading={loading} />
        </div>
      )}
    </div>
  );
};

export default PostItem; 