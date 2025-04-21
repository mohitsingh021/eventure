import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { createPost } from '../services/post.service';
import { Post } from '../types';

interface CreatePostFormProps {
  onPostCreated: (post: Post) => void;
}

const CreatePostForm = ({ onPostCreated }: CreatePostFormProps) => {
  const { currentUser, userProfile } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File is too large. Maximum size is 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        setError('Only image and video files are allowed');
        return;
      }
      
      setMediaFile(file);
      
      // Create preview for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        // For video, we could use a thumbnail, but for simplicity:
        setMediaPreview('VIDEO');
      }
    }
  };
  
  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      return setError('You must be logged in to create a post');
    }
    
    if (!content.trim() && !mediaFile) {
      return setError('Post cannot be empty');
    }
    
    try {
      setLoading(true);
      setError('');
      
      const newPost = await createPost(
        currentUser.uid,
        content,
        mediaFile || undefined
      );
      
      // Clear form
      setContent('');
      clearMedia();
      
      // Notify parent component
      onPostCreated(newPost);
    } catch (error: any) {
      console.error('Error creating post:', error);
      setError(error.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <img
              className="h-10 w-10 rounded-full"
              src={userProfile?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userProfile?.displayName || 'User')}
              alt={userProfile?.displayName}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="border-b border-gray-200 focus-within:border-indigo-600">
              <textarea
                rows={3}
                name="content"
                id="content"
                className="block w-full resize-none border-0 border-b border-transparent p-0 pb-2 focus:border-indigo-600 focus:ring-0 sm:text-sm"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
              />
            </div>
            
            {/* Media preview */}
            {mediaPreview && (
              <div className="mt-3 relative">
                {mediaPreview === 'VIDEO' ? (
                  <div className="bg-gray-100 rounded p-3 flex items-center justify-center h-24">
                    <span className="text-gray-600">Video selected</span>
                  </div>
                ) : (
                  <img 
                    src={mediaPreview} 
                    alt="Preview" 
                    className="max-h-32 rounded"
                  />
                )}
                <button
                  type="button"
                  onClick={clearMedia}
                  className="absolute top-1 right-1 bg-gray-800 bg-opacity-60 text-white rounded-full p-1"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-5">
                <div className="flow-root">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="-m-2 flex items-center rounded-full p-2 text-gray-400 hover:text-gray-500"
                    disabled={loading}
                  >
                    <PhotoIcon className="h-6 w-6" aria-hidden="true" />
                    <span className="sr-only">Add photo/video</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                    className="hidden"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  type="submit"
                  className={`inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePostForm; 