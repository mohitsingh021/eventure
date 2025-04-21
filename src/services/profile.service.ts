import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase/config';
import { User, Organizer, Sponsor, UserRole, UpcomingEvent } from '../types';

// Get user profile by ID
export const getUserProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      
      // Get role-specific data
      if (userData.role === 'organizer') {
        const organizerDoc = await getDoc(doc(firestore, 'organizers', userId));
        if (organizerDoc.exists()) {
          return organizerDoc.data() as Organizer;
        }
      } else if (userData.role === 'sponsor') {
        const sponsorDoc = await getDoc(doc(firestore, 'sponsors', userId));
        if (sponsorDoc.exists()) {
          return sponsorDoc.data() as Sponsor;
        }
      }
      
      return userData;
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update basic user profile info (shared fields)
export const updateUserProfile = async (
  userId: string, 
  data: { displayName?: string; about?: string; }
) => {
  try {
    // Update general user document
    await updateDoc(doc(firestore, 'users', userId), {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    // Get user role
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const role = userData.role as UserRole;
      
      // Update role-specific document
      await updateDoc(doc(firestore, role === 'organizer' ? 'organizers' : 'sponsors', userId), {
        ...data,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Update organizer-specific profile fields
export const updateOrganizerProfile = async (
  userId: string,
  data: {
    pastEvents?: string;
    upcomingEvents?: UpcomingEvent[];
  }
) => {
  try {
    await updateDoc(doc(firestore, 'organizers', userId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating organizer profile:', error);
    throw error;
  }
};

// Update sponsor-specific profile fields
export const updateSponsorProfile = async (
  userId: string,
  data: {
    companyName?: string;
    eventTypesSponsored?: string[];
    preferredPromotionFormat?: string[];
  }
) => {
  try {
    await updateDoc(doc(firestore, 'sponsors', userId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating sponsor profile:', error);
    throw error;
  }
};

// Add upcoming event for organizer
export const addUpcomingEvent = async (
  userId: string, 
  event: Omit<UpcomingEvent, 'id'>
) => {
  try {
    // Get current list of events
    const organizerDoc = await getDoc(doc(firestore, 'organizers', userId));
    
    if (organizerDoc.exists()) {
      const organizerData = organizerDoc.data() as Organizer;
      const upcomingEvents = organizerData.upcomingEvents || [];
      
      // Create new event with ID
      const newEvent = {
        ...event,
        id: Date.now().toString()
      };
      
      // Add to events array
      await updateDoc(doc(firestore, 'organizers', userId), {
        upcomingEvents: [...upcomingEvents, newEvent],
        updatedAt: serverTimestamp()
      });
      
      return newEvent;
    } else {
      throw new Error('Organizer not found');
    }
  } catch (error) {
    console.error('Error adding upcoming event:', error);
    throw error;
  }
};

// Remove upcoming event
export const removeUpcomingEvent = async (userId: string, eventId: string) => {
  try {
    // Get current list of events
    const organizerDoc = await getDoc(doc(firestore, 'organizers', userId));
    
    if (organizerDoc.exists()) {
      const organizerData = organizerDoc.data() as Organizer;
      const upcomingEvents = organizerData.upcomingEvents || [];
      
      // Filter out the event to remove
      const updatedEvents = upcomingEvents.filter(event => event.id !== eventId);
      
      // Update document with new events array
      await updateDoc(doc(firestore, 'organizers', userId), {
        upcomingEvents: updatedEvents,
        updatedAt: serverTimestamp()
      });
    } else {
      throw new Error('Organizer not found');
    }
  } catch (error) {
    console.error('Error removing upcoming event:', error);
    throw error;
  }
};

// Search for users based on criteria
export const searchUsers = async (
  query: string,
  filters: { role?: UserRole } = {}
) => {
  try {
    // Start with merged results array
    let results: User[] = [];
    
    // Prepare collections to search based on role filter
    const collectionsToSearch: string[] = [];
    
    if (!filters.role || filters.role === 'organizer') {
      collectionsToSearch.push('organizers');
    }
    
    if (!filters.role || filters.role === 'sponsor') {
      collectionsToSearch.push('sponsors');
    }
    
    // Search each collection
    for (const collectionName of collectionsToSearch) {
      const usersRef = collection(firestore, collectionName);
      
      // Get all documents (would be better with a full-text search solution in production)
      const snapshot = await getDocs(usersRef);
      
      // Filter results client-side (not efficient for large datasets)
      const matchingDocs = snapshot.docs.filter(doc => {
        const data = doc.data();
        const searchString = (
          data.displayName.toLowerCase() + ' ' + 
          (data.about?.toLowerCase() || '') + ' ' +
          (data.companyName?.toLowerCase() || '')
        );
        
        return searchString.includes(query.toLowerCase());
      });
      
      // Add matching docs to results
      results = [...results, ...matchingDocs.map(doc => doc.data() as User)];
    }
    
    return results;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}; 