import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPosts } from '../services/post.service';
import { Post as PostType } from '../types';
import PostItem from '../components/PostItem';
import CreatePostForm from '../components/CreatePostForm';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastPostId, setLastPostId] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  
  const loadPosts = async (lastId?: string) => {
    try {
      setLoading(true);
      const fetchedPosts = await getPosts(lastId);
      
      if (lastId) {
        // Append to existing posts for pagination
        setPosts(prevPosts => [...prevPosts, ...fetchedPosts]);
      } else {
        // Replace posts for initial load or refresh
        setPosts(fetchedPosts);
      }
      
      if (fetchedPosts.length > 0) {
        setLastPostId(fetchedPosts[fetchedPosts.length - 1].id);
      }
      
      // If we got fewer posts than the limit, we've reached the end
      setHasMore(fetchedPosts.length >= 10);
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadPosts();
  }, []);
  
  const handleLoadMore = () => {
    if (hasMore && !loading && lastPostId) {
      loadPosts(lastPostId);
    }
  };
  
  const handlePostCreated = (newPost: PostType) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Home Feed</h1>
      
      <div className="mb-8">
        <CreatePostForm onPostCreated={handlePostCreated} />
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="space-y-6">
        {posts.length === 0 && !loading ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostItem 
              key={post.id} 
              post={post} 
              currentUserId={currentUser?.uid || ''} 
            />
          ))
        )}
        
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading posts...</p>
          </div>
        )}
        
        {hasMore && !loading && posts.length > 0 && (
          <div className="text-center py-4">
            <button
              onClick={handleLoadMore}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 