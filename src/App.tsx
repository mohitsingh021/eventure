import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Layouts
import MainLayout from './layouts/MainLayout';

// Public pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';

// Protected pages
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import MyProfile from './pages/MyProfile';
import EditProfile from './pages/EditProfile';
import Chat from './pages/Chat';
import ChatRoom from './pages/ChatRoom';
import Search from './pages/Search';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected routes */}
          <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="profile/edit" element={<EditProfile />} />
            <Route path="profile/:userId" element={<UserProfile />} />
            <Route path="chat" element={<Chat />} />
            <Route path="chat/:roomId" element={<ChatRoom />} />
            <Route path="search" element={<Search />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Redirect any unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
