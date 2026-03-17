import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import PublicNavbar from './components/PublicNavbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ArtistProfile from './pages/ArtistProfile';
import ArtistDashboard from './pages/ArtistDashboard';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OrderDetail from './pages/OrderDetail';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import BrowseArtists from './pages/BrowseArtists';
import Community from './pages/Community';
import About from './pages/About';
import { Toaster } from 'react-hot-toast';
import { getCurrentUser } from './services/api';
import { setCredentials, setAuthLoading } from './store/authSlice';

// Public-only routes that use the minimal landing navbar
const PUBLIC_ONLY_ROUTES = ['/', '/login', '/register', '/forgot-password', '/community', '/about'];

function AppLayout() {
  const { user } = useSelector(state => state.auth);
  const isPublicPage = PUBLIC_ONLY_ROUTES.includes(pathname);

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 font-inter text-deep-cocoa">
      {isPublicPage && !user ? <PublicNavbar /> : <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/community" element={<Community />} />
          <Route path="/about" element={<About />} />
          <Route path="/artists" element={<BrowseArtists />} />
          <Route path="/artists/:id" element={<ArtistProfile />} />
          <Route path="/artist-dashboard" element={<ProtectedRoute><ArtistDashboard /></ProtectedRoute>} />
          <Route path="/client-dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        let token = localStorage.getItem('accessToken');
        
        // Always try to fetch current user to test token/cookie
        // If it fails with 401, the api.js interceptor will automatically try the refresh token!
        let res;
        try {
           res = await getCurrentUser();
        } catch(e) {
            // First attempt failed, maybe token was missing or expired.
            // Let's explicitly try to refresh just in case the interceptor missed it due to lack of token
           if (e.response?.status === 401 && !token) {
               const refreshRes = await api.post('/auth/refresh-token');
               token = refreshRes.data.data.accessToken;
               localStorage.setItem('accessToken', token);
               res = await getCurrentUser(); // Try again with fresh token
           } else {
               throw e;
           }
        }

        if (res && res.data.data) {
          // Double check token is latest
          token = localStorage.getItem('accessToken') || token;
          dispatch(setCredentials({ 
            user: res.data.data, 
            accessToken: token 
          }));
        }
      } catch (error) {
        console.error("Silent refresh failed or no valid session found");
        localStorage.removeItem('accessToken');
      } finally {
        dispatch(setAuthLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{
          style: {
              background: '#3d3028',
              color: '#fff',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
          },
          success: {
              iconTheme: {
                  primary: '#fff',
                  secondary: '#3d3028',
              },
          },
      }} />
      <AppLayout />
    </Router>
  );
}

export default App;
