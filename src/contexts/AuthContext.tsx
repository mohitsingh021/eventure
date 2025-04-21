import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  sendPasswordResetEmail,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sign up function
  async function signUp(email: string, password: string, role: UserRole, displayName: string) {
    try {
      // Create user in Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      try {
        // Update profile with display name
        await updateProfile(user, {
          displayName: displayName
        });
        
        // Create user document in Firestore
        const userDoc = {
          id: user.uid,
          email: user.email || '',
          role: role,
          displayName: displayName,
          photoURL: '',
          about: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Add user to Firestore
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
      } catch (firestoreError) {
        console.error('Firestore error during signup:', firestoreError);
        // If Firestore operations fail, but Auth succeeded, clean up by deleting the Auth user
        try {
          await deleteUser(user);
        } catch (deleteError) {
          console.error('Failed to delete auth user after Firestore error:', deleteError);
        }
        throw new Error('Failed to create user profile. Please check your Firebase security rules.');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  }

  // Login function
  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Logout function
  function logout() {
    return signOut(auth);
  }

  // Reset password
  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  // Load user profile from Firestore
  async function loadUserProfile(user: FirebaseUser) {
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      setUserProfile({
        ...userData,
        id: user.uid
      });
    } else {
      console.error('User document not found in Firestore');
      setUserProfile(null);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signUp,
    login,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 