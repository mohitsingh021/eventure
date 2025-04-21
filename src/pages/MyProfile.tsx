import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/profile.service';
import { getUserPosts } from '../services/post.service';
import { Organizer, Sponsor, Post } from '../types';
import PostItem from '../components/PostItem';
import OrganizerDetails from '../components/OrganizerDetails';
import SponsorDetails from '../components/SponsorDetails';

const MyProfile = () => {
  const { currentUser, userProfile } = useAuth();
  const [profileData, setProfileData] = useState<Organizer | Sponsor | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch detailed profile data
        const profile = await getUserProfile(currentUser.uid);
        setProfileData(profile);
        
        // Fetch user posts
        const posts = await getUserPosts(currentUser.uid);
        setUserPosts(posts);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  if (!currentUser || !userProfile) {
    return (
      <div className="text-center py-12">
        <p>Please log in to view your profile</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading profile...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Cover Image */}
            <div className="relative h-48 bg-gray-200">
              {profileData?.coverImageURL ? (
                <img
                  src={profileData.coverImageURL}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600" />
              )}
              
              <Link 
                to="/profile/edit" 
                className="absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-100"
              >
                <PencilIcon className="h-5 w-5 text-gray-600" />
              </Link>
            </div>
            
            <div className="relative px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-end -mt-16 sm:-mt-20">
                <div className="inline-block rounded-full overflow-hidden border-4 border-white h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0">
                  <img
                    src={profileData?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profileData?.displayName || 'User')}
                    alt={profileData?.displayName}
                    className="h-full w-full object-cover"
                  />
                </div>
                
                <div className="mt-4 sm:mt-0 sm:ml-4 flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{profileData?.displayName}</h1>
                  <p className="text-gray-600">{profileData?.role === 'organizer' ? 'Event Organizer' : 'Sponsor'}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h2 className="text-lg font-semibold">About</h2>
                <p className="mt-2 text-gray-600">
                  {profileData?.about || 'No information provided yet.'}
                </p>
              </div>
              
              {/* Role-specific details */}
              <div className="mt-8">
                {profileData?.role === 'organizer' ? (
                  <OrganizerDetails organizer={profileData as Organizer} />
                ) : (
                  <SponsorDetails sponsor={profileData as Sponsor} />
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">My Posts</h2>
            
            {userPosts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                You haven't posted anything yet.
              </div>
            ) : (
              <div className="space-y-6">
                {userPosts.map(post => (
                  <PostItem
                    key={post.id}
                    post={post}
                    currentUserId={currentUser.uid}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MyProfile; 