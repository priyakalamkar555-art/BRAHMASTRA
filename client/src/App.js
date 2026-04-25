import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout        from './components/Layout';
import AuthPage      from './pages/AuthPage';
import SOSPage       from './pages/SOSPage';
import ContactsPage  from './pages/ContactsPage';
import LocationPage  from './pages/LocationPage';
import NotesPage     from './pages/NotesPage';
import ProfilePage   from './pages/ProfilePage';

const Spinner = () => (
  <div style={{ display:'flex', justifyContent:'center', alignItems:'center',
    height:'100vh', background:'#0a0a0f', color:'#ff6b6b', fontSize:'1.2rem' }}>
    Loading...
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/auth" replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SocketProvider>
              <Layout />
            </SocketProvider>
          </ProtectedRoute>
        }
      >
        <Route index           element={<SOSPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="location" element={<LocationPage />} />
        <Route path="notes"    element={<NotesPage />} />
        <Route path="profile"  element={<ProfilePage />} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}