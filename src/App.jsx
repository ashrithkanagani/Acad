import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext'; // Updated import path!
import { useEffect } from 'react';

import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Timetable from './pages/Timetable';
import Assignments from './pages/Assignments';
import PhotoToPdf from './pages/PhotoToPdf';
import Reminders from './pages/Reminders';
import Settings from './pages/Settings';
import Files from './pages/Files';
import './assets/global.css';

// Protected Route Component
function ProtectedRoute({ children, isLoading }) {
  const { user } = useAppContext(); // Changed from currentUser to user
  
  // While session is loading, don't render anything
  if (isLoading) {
    return null;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Loading Screen Component
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text-muted)',
      fontSize: '0.9rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
        <div>Loading session...</div>
      </div>
    </div>
  );
}


// Theme Provider Component
function ThemedRouter({ children }) {
  const { settings } = useAppContext();
  
  useEffect(() => {
    // Apply theme settings to document (with safe fallbacks)
    const darkMode = settings?.appearance?.darkMode ?? true;
    const compactView = settings?.appearance?.compactView ?? false;
    
    if (darkMode) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    if (compactView) {
      document.documentElement.setAttribute('data-compact', 'true');
    } else {
      document.documentElement.removeAttribute('data-compact');
    }
  }, [settings?.appearance]);

  return children;
}

function App() {
  const { user, isSessionLoading, logout } = useAppContext(); // Changed from currentUser to user

  // Show loading screen while session is being restored
  if (isSessionLoading) {
    return <LoadingScreen />;
  }

  // Validate session on app load and after page refresh
  useEffect(() => {
    if (user) {
      try {
        const savedSession = localStorage.getItem('acadweb_session');
        if (!savedSession) {
          logout();
          return;
        }

        const { timestamp } = JSON.parse(savedSession);
        const now = Date.now();
        const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

        if (now - timestamp >= SESSION_DURATION) {
          // Session expired, log out
          logout();
        }
      } catch (error) {
        console.error('Error validating session:', error);
        logout();
      }
    }
  }, [user, logout]); // Added dependencies to avoid React warnings

  return (
    <Router>
      <ThemedRouter>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />

          {/* Root redirects to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isLoading={isSessionLoading}>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notes"
            element={
              <ProtectedRoute isLoading={isSessionLoading}>
                <Layout>
                  <Notes />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/timetable"
            element={
              <ProtectedRoute isLoading={isSessionLoading}>
                <Layout>
                  <Timetable />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assignments"
            element={
              <ProtectedRoute isLoading={isSessionLoading}>
                <Layout>
                  <Assignments />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/files"
            element={
              <ProtectedRoute isLoading={isSessionLoading}>
                <Layout>
                  <Files />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pdf"
            element={
              <ProtectedRoute isLoading={isSessionLoading}>
                <Layout>
                  <PhotoToPdf />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reminders"
            element={
              <ProtectedRoute isLoading={isSessionLoading}>
                <Layout>
                  <Reminders />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute isLoading={isSessionLoading}>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all: redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </ThemedRouter>
    </Router>
  );
}
export default App;
