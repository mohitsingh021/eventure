import { 
  collection, 
  doc, 
  addDoc,
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { firestore, storage } from '../firebase/config';
import { Post, Comment, User } from '../types';

// Create a new post
export const createPost = async (
  userId: string,
  content: string,
  media?: File
) => {
  try {
    // Get user details
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data() as User;
    
    // Initialize post data
    const postData: Omit<Post, 'id'> = {
      userId,
      userRole: userData.role,
      displayName: userData.displayName,
      userPhotoURL: userData.photoURL,
      content,
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any
    };
    
    // Upload media if provided
    if (media) {
      const mediaType = media.type.startsWith('image/') ? 'image' : 'video';
      
      // Only accept image or video files
      if (!media.type.startsWith('image/') && !media.type.startsWith('video/')) {
        throw new Error('Invalid media type. Only images and videos are allowed.');
      }
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `postMedia/${userId}/${Date.now()}_${media.name}`);
      await uploadBytes(storageRef, media);
      const mediaURL = await getDownloadURL(storageRef);
      
      // Add media info to post data
      postData.mediaURL = mediaURL;
      postData.mediaType = mediaType;
    }
    
    // Add post to Firestore
    const postRef = await addDoc(collection(firestore, 'posts'), postData);
    
    // Return the created post with its ID
    return {
      id: postRef.id,
      ...postData
    };
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Get posts for home feed with pagination
export const getPosts = async (lastPostId?: string, postsPerPage = 10) => {
  try {
    const postsRef = collection(firestore, 'posts');
    let postsQuery = query(postsRef, orderBy('createdAt', 'desc'), limit(postsPerPage));
    
    // If we have a last post ID, start after that post
    if (lastPostId) {
      const lastPostDoc = await getDoc(doc(firestore, 'posts', lastPostId));
      if (lastPostDoc.exists()) {
        postsQuery = query(postsRef, orderBy('createdAt', 'desc'), startAfter(lastPostDoc), limit(postsPerPage));
      }
    }
    
    const querySnapshot = await getDocs(postsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

// Get a single post by ID
export const getPostById = async (postId: string) => {
  try {
    const postDoc = await getDoc(doc(firestore, 'posts', postId));
    
    if (postDoc.exists()) {
      return {
        id: postDoc.id,
        ...postDoc.data()
      } as Post;
    } else {
      throw new Error('Post not found');
    }
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
};

// Update a post
export const updatePost = async (
  postId: string, 
  userId: string, 
  data: { content: string }
) => {
  try {
    const postDoc = await getDoc(doc(firestore, 'posts', postId));
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    
    // Verify post ownership
    if (postData.userId !== userId) {
      throw new Error('Unauthorized to update this post');
    }
    
    // Update post
    await updateDoc(doc(firestore, 'posts', postId), {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return {
      id: postId,
      ...postDoc.data(),
      ...data,
      updatedAt: new Date()
    } as Post;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (postId: string, userId: string) => {
  try {
    const postDoc = await getDoc(doc(firestore, 'posts', postId));
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    
    // Verify post ownership
    if (postData.userId !== userId) {
      throw new Error('Unauthorized to delete this post');
    }
    
    // Delete media from storage if exists
    if (postData.mediaURL) {
      // Extract file path from URL
      const mediaPath = decodeURIComponent(postData.mediaURL.split('/o/')[1].split('?')[0]);
      const storageRef = ref(storage, mediaPath);
      
      try {
        await deleteObject(storageRef);
      } catch (storageError) {
        console.error('Error deleting media from storage:', storageError);
        // Continue with post deletion even if media deletion fails
      }
    }
    
    // Delete post document
    await deleteDoc(doc(firestore, 'posts', postId));
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Like a post
export const likePost = async (postId: string, userId: string) => {
  try {
    const postRef = doc(firestore, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    
    // Check if user already liked the post
    if (postData.likedBy && postData.likedBy.includes(userId)) {
      throw new Error('Post already liked by user');
    }
    
    // Update post with like
    await updateDoc(postRef, {
      likes: (postData.likes || 0) + 1,
      likedBy: arrayUnion(userId)
    });
    
    // Create notification for post owner
    if (postData.userId !== userId) {
      // Get user details for notification
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        
        await addDoc(collection(firestore, 'notifications'), {
          userId: postData.userId,
          type: 'like',
          sourceId: postId,
          sourceUserId: userId,
          sourceUserName: userData.displayName,
          sourceUserPhoto: userData.photoURL,
          read: false,
          createdAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Unlike a post
export const unlikePost = async (postId: string, userId: string) => {
  try {
    const postRef = doc(firestore, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    
    // Check if user has liked the post
    if (!postData.likedBy || !postData.likedBy.includes(userId)) {
      throw new Error('Post not liked by user');
    }
    
    // Update post to remove like
    await updateDoc(postRef, {
      likes: Math.max(0, (postData.likes || 0) - 1),
      likedBy: arrayRemove(userId)
    });
    
    // Optionally, remove the notification (more complex)
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (
  postId: string,
  userId: string,
  content: string
) => {
  try {
    // Get user details
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data() as User;
    
    // Create comment object
    const comment: Comment = {
      id: Date.now().toString(),
      userId,
      displayName: userData.displayName,
      userPhotoURL: userData.photoURL,
      content,
      createdAt: serverTimestamp() as any
    };
    
    // Add comment to post
    const postRef = doc(firestore, 'posts', postId);
    await updateDoc(postRef, {
      comments: arrayUnion(comment)
    });
    
    // Get post data for notification
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const postData = postDoc.data();
      
      // Create notification for post owner if commenter is not post owner
      if (postData.userId !== userId) {
        await addDoc(collection(firestore, 'notifications'), {
          userId: postData.userId,
          type: 'comment',
          sourceId: postId,
          sourceUserId: userId,
          sourceUserName: userData.displayName,
          sourceUserPhoto: userData.photoURL,
          read: false,
          createdAt: serverTimestamp()
        });
      }
    }
    
    return comment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Get user posts
export const getUserPosts = async (userId: string) => {
  try {
    const postsRef = collection(firestore, 'posts');
    const postsQuery = query(postsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(postsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];
  } catch (error) {
    console.error('Error getting user posts:', error);
    throw error;
  }
}; 