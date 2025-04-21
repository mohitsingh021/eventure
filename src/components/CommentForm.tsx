import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  loading: boolean;
}

const CommentForm = ({ onSubmit, loading }: CommentFormProps) => {
  const [content, setContent] = useState('');
  const { userProfile } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || loading) return;
    
    await onSubmit(content);
    setContent(''); // Clear form after submission
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        <img
          className="h-8 w-8 rounded-full object-cover"
          src={userProfile?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userProfile?.displayName || 'User')}
          alt={userProfile?.displayName}
        />
      </div>
      <div className="min-w-0 flex-1 relative">
        <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
          <textarea
            rows={1}
            name="comment"
            id="comment"
            className="block w-full py-2 pl-3 pr-10 border-0 resize-none focus:ring-0 focus:outline-none sm:text-sm"
            placeholder="Add a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
          <button
            type="submit"
            disabled={!content.trim() || loading}
            className={`inline-flex items-center rounded-full border border-transparent p-1 ${
              !content.trim() || loading
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-indigo-600 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            <PaperAirplaneIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm; 