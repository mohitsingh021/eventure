import { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhotoIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile, updateOrganizerProfile, updateSponsorProfile, addUpcomingEvent, removeUpcomingEvent } from '../services/profile.service';
import { uploadProfileImage, uploadCoverImage } from '../services/auth.service';
import { Organizer, Sponsor, UpcomingEvent } from '../types';

const EditProfile = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState<Organizer | Sponsor | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [about, setAbout] = useState('');
  const [pastEvents, setPastEvents] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [eventTypesSponsored, setEventTypesSponsored] = useState<string[]>([]);
  const [newEventType, setNewEventType] = useState('');
  const [preferredPromotionFormat, setPreferredPromotionFormat] = useState<string[]>([]);
  const [newPromotionFormat, setNewPromotionFormat] = useState('');
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  
  // New upcoming event fields
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventBudget, setNewEventBudget] = useState('');
  const [newEventAudience, setNewEventAudience] = useState('');
  const [newEventSponsorship, setNewEventSponsorship] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const profileImageRef = useRef<HTMLInputElement>(null);
  const coverImageRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch detailed profile data
        const profile = await getUserProfile(currentUser.uid);
        setProfileData(profile);
        
        // Set form values
        setDisplayName(profile.displayName || '');
        setAbout(profile.about || '');
        
        if (profile.role === 'organizer') {
          const organizerProfile = profile as Organizer;
          setPastEvents(organizerProfile.pastEvents || '');
          setUpcomingEvents(organizerProfile.upcomingEvents || []);
        } else if (profile.role === 'sponsor') {
          const sponsorProfile = profile as Sponsor;
          setCompanyName(sponsorProfile.companyName || '');
          setEventTypesSponsored(sponsorProfile.eventTypesSponsored || []);
          setPreferredPromotionFormat(sponsorProfile.preferredPromotionFormat || []);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  const handleProfileImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !e.target.files || e.target.files.length === 0) return;
    
    try {
      setError('');
      setSaveLoading(true);
      
      const file = e.target.files[0];
      await uploadProfileImage(currentUser.uid, file);
      
      setMessage('Profile image updated successfully');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setError('Failed to upload profile image');
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleCoverImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !e.target.files || e.target.files.length === 0) return;
    
    try {
      setError('');
      setSaveLoading(true);
      
      const file = e.target.files[0];
      await uploadCoverImage(currentUser.uid, file);
      
      setMessage('Cover image updated successfully');
    } catch (error) {
      console.error('Error uploading cover image:', error);
      setError('Failed to upload cover image');
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleAddEventType = () => {
    if (!newEventType.trim()) return;
    
    setEventTypesSponsored(prev => [...prev, newEventType.trim()]);
    setNewEventType('');
  };
  
  const handleRemoveEventType = (index: number) => {
    setEventTypesSponsored(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleAddPromotionFormat = () => {
    if (!newPromotionFormat.trim()) return;
    
    setPreferredPromotionFormat(prev => [...prev, newPromotionFormat.trim()]);
    setNewPromotionFormat('');
  };
  
  const handleRemovePromotionFormat = (index: number) => {
    setPreferredPromotionFormat(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleAddUpcomingEvent = async () => {
    if (!currentUser) return;
    if (!newEventName || !newEventDate || !newEventDescription || !newEventBudget || !newEventAudience || !newEventSponsorship) {
      return setError('Please fill in all fields for the new event');
    }
    
    try {
      setError('');
      setSaveLoading(true);
      
      const newEvent = {
        name: newEventName,
        date: new Date(newEventDate) as any,
        description: newEventDescription,
        budgetRange: newEventBudget,
        audienceType: newEventAudience,
        sponsorshipRequirements: newEventSponsorship
      };
      
      const addedEvent = await addUpcomingEvent(currentUser.uid, newEvent);
      
      // Update local state
      setUpcomingEvents(prev => [...prev, addedEvent]);
      
      // Clear form
      setNewEventName('');
      setNewEventDate('');
      setNewEventDescription('');
      setNewEventBudget('');
      setNewEventAudience('');
      setNewEventSponsorship('');
      
      setMessage('Event added successfully');
    } catch (error) {
      console.error('Error adding upcoming event:', error);
      setError('Failed to add event');
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleRemoveUpcomingEvent = async (eventId: string) => {
    if (!currentUser) return;
    
    try {
      setError('');
      setSaveLoading(true);
      
      await removeUpcomingEvent(currentUser.uid, eventId);
      
      // Update local state
      setUpcomingEvents(prev => prev.filter(event => event.id !== eventId));
      
      setMessage('Event removed successfully');
    } catch (error) {
      console.error('Error removing upcoming event:', error);
      setError('Failed to remove event');
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      setError('');
      setMessage('');
      setSaveLoading(true);
      
      // Update basic profile info
      await updateUserProfile(currentUser.uid, {
        displayName,
        about
      });
      
      // Update role-specific profile info
      if (userProfile?.role === 'organizer') {
        await updateOrganizerProfile(currentUser.uid, {
          pastEvents
        });
      } else if (userProfile?.role === 'sponsor') {
        await updateSponsorProfile(currentUser.uid, {
          companyName,
          eventTypesSponsored,
          preferredPromotionFormat
        });
      }
      
      setMessage('Profile updated successfully');
      
      // Navigate back to profile after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };
  
  if (!currentUser || !userProfile) {
    return (
      <div className="text-center py-12">
        <p>Please log in to edit your profile</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {message && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <p className="text-sm text-green-700">{message}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading profile...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium leading-6 text-gray-900">Profile Images</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Upload a profile photo and cover image to personalize your profile
                </p>
                
                <div className="mt-4 flex gap-6">
                  {/* Profile Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                    <div className="mt-1 flex items-center">
                      <div className="relative inline-block h-24 w-24 overflow-hidden rounded-full">
                        <img
                          src={profileData?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profileData?.displayName || 'User')}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => profileImageRef.current?.click()}
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity"
                          disabled={saveLoading}
                        >
                          <PhotoIcon className="h-8 w-8" />
                        </button>
                      </div>
                      <input
                        type="file"
                        ref={profileImageRef}
                        onChange={handleProfileImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                  
                  {/* Cover Image */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Cover Image</label>
                    <div className="mt-1">
                      <div className="relative h-24 w-full overflow-hidden rounded-lg">
                        {profileData?.coverImageURL ? (
                          <img
                            src={profileData.coverImageURL}
                            alt="Cover"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-r from-indigo-500 to-purple-600" />
                        )}
                        <button
                          type="button"
                          onClick={() => coverImageRef.current?.click()}
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity"
                          disabled={saveLoading}
                        >
                          <PhotoIcon className="h-8 w-8" />
                        </button>
                      </div>
                      <input
                        type="file"
                        ref={coverImageRef}
                        onChange={handleCoverImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h2>
                
                <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                      {userProfile.role === 'organizer' ? 'Organization Name' : 'Company Name'}
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="displayName"
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        disabled={saveLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                      About
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="about"
                        name="about"
                        rows={4}
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Tell us about yourself or your organization"
                        disabled={saveLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Organizer-specific fields */}
              {userProfile.role === 'organizer' && (
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-medium leading-6 text-gray-900">Organizer Details</h2>
                  
                  <div className="mt-4">
                    <label htmlFor="pastEvents" className="block text-sm font-medium text-gray-700">
                      Past Events
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="pastEvents"
                        name="pastEvents"
                        rows={4}
                        value={pastEvents}
                        onChange={(e) => setPastEvents(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="List your past events and accomplishments"
                        disabled={saveLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-md font-medium">Upcoming Events</h3>
                    
                    {/* List existing upcoming events */}
                    <div className="mt-2 space-y-4">
                      {upcomingEvents.map((event) => (
                        <div key={event.id} className="flex items-start p-4 border border-gray-300 rounded-md">
                          <div className="flex-1">
                            <h4 className="font-medium">{event.name}</h4>
                            <p className="text-sm text-gray-500">
                              Date: {new Date(event.date.toDate()).toLocaleDateString()}
                            </p>
                            <p className="text-sm mt-1">{event.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveUpcomingEvent(event.id)}
                            className="text-red-500 hover:text-red-700"
                            disabled={saveLoading}
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add new upcoming event */}
                    <div className="mt-4 border border-gray-300 rounded-md p-4">
                      <h4 className="font-medium mb-3">Add New Event</h4>
                      
                      <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="newEventName" className="block text-sm font-medium text-gray-700">
                            Event Name
                          </label>
                          <input
                            type="text"
                            id="newEventName"
                            value={newEventName}
                            onChange={(e) => setNewEventName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            disabled={saveLoading}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="newEventDate" className="block text-sm font-medium text-gray-700">
                            Date
                          </label>
                          <input
                            type="date"
                            id="newEventDate"
                            value={newEventDate}
                            onChange={(e) => setNewEventDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            disabled={saveLoading}
                          />
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label htmlFor="newEventDescription" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            id="newEventDescription"
                            value={newEventDescription}
                            onChange={(e) => setNewEventDescription(e.target.value)}
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            disabled={saveLoading}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="newEventBudget" className="block text-sm font-medium text-gray-700">
                            Budget Range
                          </label>
                          <input
                            type="text"
                            id="newEventBudget"
                            value={newEventBudget}
                            onChange={(e) => setNewEventBudget(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="e.g. $5,000 - $10,000"
                            disabled={saveLoading}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="newEventAudience" className="block text-sm font-medium text-gray-700">
                            Audience Type
                          </label>
                          <input
                            type="text"
                            id="newEventAudience"
                            value={newEventAudience}
                            onChange={(e) => setNewEventAudience(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="e.g. Tech Professionals"
                            disabled={saveLoading}
                          />
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label htmlFor="newEventSponsorship" className="block text-sm font-medium text-gray-700">
                            Sponsorship Requirements
                          </label>
                          <textarea
                            id="newEventSponsorship"
                            value={newEventSponsorship}
                            onChange={(e) => setNewEventSponsorship(e.target.value)}
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            disabled={saveLoading}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={handleAddUpcomingEvent}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          disabled={saveLoading}
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Event
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Sponsor-specific fields */}
              {userProfile.role === 'sponsor' && (
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-medium leading-6 text-gray-900">Sponsor Details</h2>
                  
                  <div className="mt-4">
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                      Company Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        disabled={saveLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Event Types Sponsored
                    </label>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      {eventTypesSponsored.map((type, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                        >
                          <span>{type}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEventType(index)}
                            className="ml-2 text-indigo-600 hover:text-indigo-800 focus:outline-none"
                            disabled={saveLoading}
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-2 flex">
                      <input
                        type="text"
                        value={newEventType}
                        onChange={(e) => setNewEventType(e.target.value)}
                        placeholder="Add event type"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        disabled={saveLoading}
                      />
                      <button
                        type="button"
                        onClick={handleAddEventType}
                        className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={!newEventType || saveLoading}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Preferred Promotion Format
                    </label>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      {preferredPromotionFormat.map((format, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          <span>{format}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePromotionFormat(index)}
                            className="ml-2 text-green-600 hover:text-green-800 focus:outline-none"
                            disabled={saveLoading}
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-2 flex">
                      <input
                        type="text"
                        value={newPromotionFormat}
                        onChange={(e) => setNewPromotionFormat(e.target.value)}
                        placeholder="Add promotion format"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        disabled={saveLoading}
                      />
                      <button
                        type="button"
                        onClick={handleAddPromotionFormat}
                        className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={!newPromotionFormat || saveLoading}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                  disabled={saveLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={saveLoading}
                >
                  {saveLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EditProfile; 