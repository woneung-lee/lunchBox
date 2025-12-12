import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import DateDetail from './pages/DateDetail';
import GroupSettings from './pages/GroupSettings';
import './styles/global.css';

// 인증된 사용자만 접근 가능한 라우트
function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '24px'
      }}>
        🍱 로딩 중...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

// 비인증 사용자만 접근 가능한 라우트 (로그인, 회원가입)
function PublicRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '24px'
      }}>
        🍱 로딩 중...
      </div>
    );
  }

  return user ? <Navigate to="/groups" /> : children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 루트 경로 */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 인증 관련 라우트 */}
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

        {/* 보호된 라우트 */}
        <Route 
          path="/groups" 
          element={
            <ProtectedRoute>
              <Groups />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/group/:groupId" 
          element={
            <ProtectedRoute>
              <GroupDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/group/:groupId/date/:dateKey" 
          element={
            <ProtectedRoute>
              <DateDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/group/:groupId/settings" 
          element={
            <ProtectedRoute>
              <GroupSettings />
            </ProtectedRoute>
          } 
        />

        {/* 404 페이지 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
