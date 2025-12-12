import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Groups from './pages/Groups';
import GroupLayout from './pages/GroupLayout';
import GroupMain from './pages/GroupMain';
import DateDetail from './pages/DateDetail';
import GroupRestaurants from './pages/GroupRestaurants';
import GroupMembers from './pages/GroupMembers';
import GroupStats from './pages/GroupStats';
import GroupRoulette from './pages/GroupRoulette';
import GroupSettingsPage from './pages/GroupSettingsPage';
import { getCurrentUser } from './utils/auth';

// Protected Route Component
function ProtectedRoute({ children }) {
  const user = getCurrentUser();
  return user ? children : <Navigate to="/login" replace />;
}

// Public Route Component (redirect if logged in)
function PublicRoute({ children }) {
  const user = getCurrentUser();
  return !user ? children : <Navigate to="/groups" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/groups" 
          element={
            <ProtectedRoute>
              <Groups />
            </ProtectedRoute>
          } 
        />

        {/* Group Routes with Layout */}
        <Route 
          path="/group/:groupId" 
          element={
            <ProtectedRoute>
              <GroupLayout />
            </ProtectedRoute>
          }
        >
          {/* Main tabs */}
          <Route index element={<GroupMain />} />
          <Route path="restaurants" element={<GroupRestaurants />} />
          <Route path="members" element={<GroupMembers />} />
          <Route path="stats" element={<GroupStats />} />
          <Route path="roulette" element={<GroupRoulette />} />
          <Route path="settings" element={<GroupSettingsPage />} />
          
          {/* Date detail (from calendar) */}
          <Route path="date/:dateKey" element={<DateDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
