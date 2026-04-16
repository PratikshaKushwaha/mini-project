
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import PublicNavbar from './components/PublicNavbar';
import Footer from './components/Footer';

import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CompleteProfile from './pages/auth/CompleteProfile';
import ForgotPassword from './pages/auth/ForgotPassword';
import ArtistProfile from './pages/public/ArtistProfile';
import ArtistDashboard from './pages/dashboard/ArtistDashboard';
import ClientDashboard from './pages/dashboard/ClientDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import OrderDetail from './pages/orders/OrderDetail';
import NotFound from './pages/public/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Discover from './pages/public/Discover';
import Community from './pages/public/Community';
import About from './pages/public/About';
import { Toaster } from 'react-hot-toast';

import { getCurrentUser } from './services/api';
import { setCredentials, setAuthLoading, logoutUser } from './store/authSlice';

// Public-only routes
const PUBLIC_ONLY_ROUTES = [
  '/',
  '/login',
  '/register',
  '/complete-profile',
  '/forgot-password',
  '/community',
  '/discover',
  '/about'
];

function AppLayout() {
  const { user } = useSelector(state => state.auth);
  const location = useLocation();
  const pathname = location.pathname;

  const isPublicRoute = PUBLIC_ONLY_ROUTES.some(route =>
    pathname === route || (route !== '/' && pathname.startsWith(route + '/'))
  );

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 font-inter text-deep-cocoa">
      {isPublicRoute && !user ? <PublicNavbar /> : <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/community" element={<Community />} />
          <Route path="/about" element={<About />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/artists" element={<Discover />} />
          <Route path="/artists/:id" element={<ArtistProfile />} />

          <Route path="/artist-dashboard" element={
            <ProtectedRoute>
              <ArtistDashboard />
            </ProtectedRoute>
          } />

          <Route path="/client-dashboard" element={
            <ProtectedRoute>
              <ClientDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin-dashboard" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/orders/:id" element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          } />
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
        const res = await getCurrentUser();
        if (res?.data?.data) {
          dispatch(setCredentials({
            user: res.data.data,
            accessToken: null // Token stays in memory only
          }));
        }
      } catch (error) {
        // Only logout if it's truly unauthenticated (401)
        if (error.response?.status === 401) {
          console.log("Session expired or invalid");
          dispatch(logoutUser());
        } else {
          console.error("Auth initialization error:", error);
        }
      } finally {
        dispatch(setAuthLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
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
        }}
      />
      <AppLayout />
    </Router>
  );
}

export default App;