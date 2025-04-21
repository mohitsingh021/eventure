import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, firestore, storage } from '../firebase/config';
import { User, UserRole } from '../types';

// Register a new user
export const registerUser = async (
  email: string, 
  password: string, 
  displayName: string,
  role: UserRole
) => {
  try {
    // Create user in Firebase Auth
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Create base user document in Firestore
    const userDoc = {
      uid: user.uid,
      email: user.email || '',
      role,
      displayName,
      photoURL: '',
      coverImageURL: '',
      about: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Add user to users collection
    await setDoc(doc(firestore, 'users', user.uid), userDoc);
    
    // Create role-specific profile
    if (role === 'organizer') {
      await setDoc(doc(firestore, 'organizers', user.uid), {
        ...userDoc,
        pastEvents: '',
        upcomingEvents: []
      });
    } else if (role === 'sponsor') {
      await setDoc(doc(firestore, 'sponsors', user.uid), {
        ...userDoc,
        companyName: displayName,
        eventTypesSponsored: [],
        preferredPromotionFormat: []
      });
    }
    
    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Get current user profile
export const getCurrentUserProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    
    if (userDoc.exists()) {
      return userDoc.data() as User;
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Upload profile image
export const uploadProfileImage = async (userId: string, file: File) => {
  try {
    const storageRef = ref(storage, `profileImages/${userId}/profile-${Date.now()}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update user document with photo URL
    await updateDoc(doc(firestore, 'users', userId), {
      photoURL: downloadURL,
      updatedAt: serverTimestamp()
    });
    
    // Update role-specific document
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    const userData = userDoc.data();
    
    if (userData) {
      const role = userData.role as UserRole;
      await updateDoc(doc(firestore, role === 'organizer' ? 'organizers' : 'sponsors', userId), {
        photoURL: downloadURL,
        updatedAt: serverTimestamp()
      });
    }
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

// Upload cover image
export const uploadCoverImage = async (userId: string, file: File) => {
  try {
    const storageRef = ref(storage, `profileImages/${userId}/cover-${Date.now()}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update user document with cover URL
    await updateDoc(doc(firestore, 'users', userId), {
      coverImageURL: downloadURL,
      updatedAt: serverTimestamp()
    });
    
    // Update role-specific document
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    const userData = userDoc.data();
    
    if (userData) {
      const role = userData.role as UserRole;
      await updateDoc(doc(firestore, role === 'organizer' ? 'organizers' : 'sponsors', userId), {
        coverImageURL: downloadURL,
        updatedAt: serverTimestamp()
      });
    }
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading cover image:', error);
    throw error;
  }
}; 