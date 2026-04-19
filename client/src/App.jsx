
import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import PublicNavbar from './components/PublicNavbar';
import Footer from './components/Footer';

import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import Loader from './components/Loader';

import { getCurrentUser } from './services/api';
import { setCredentials, setAuthLoading, logoutUser } from './store/authSlice';

// Lazy loaded page components
const Home = lazy(() => import('./pages/public/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const CompleteProfile = lazy(() => import('./pages/auth/CompleteProfile'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ArtistProfile = lazy(() => import('./pages/public/ArtistProfile'));
const ArtistDashboard = lazy(() => import('./pages/dashboard/ArtistDashboard'));
const ClientDashboard = lazy(() => import('./pages/dashboard/ClientDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const OrderDetail = lazy(() => import('./pages/orders/OrderDetail'));
const NotFound = lazy(() => import('./pages/public/NotFound'));
const Discover = lazy(() => import('./pages/public/Discover'));
const Community = lazy(() => import('./pages/public/Community'));
const About = lazy(() => import('./pages/public/About'));

// Public routes — show PublicNavbar when no user session exists
const PUBLIC_ONLY_ROUTES = [
  '/',
  '/login',
  '/register',
  '/complete-profile',
  '/forgot-password',
  '/community',
  '/discover',
  '/about',
];

// Routes where the global Footer should NOT appear (full-screen app layouts)
const APP_ONLY_ROUTES = [
  '/artist-dashboard',
  '/client-dashboard',
  '/admin-dashboard',
  '/orders',
];

function AppLayout() {
  const { user } = useSelector(state => state.auth);
  const location = useLocation();
  const pathname = location.pathname;

  const isPublicRoute = PUBLIC_ONLY_ROUTES.some(route =>
    pathname === route || (route !== '/' && pathname.startsWith(route + '/'))
  );

  const isAppOnlyRoute = APP_ONLY_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/') || pathname.startsWith(route)
  );

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 font-inter text-deep-cocoa">
      {isPublicRoute && !user ? <PublicNavbar /> : <Navbar />}

      <main className="flex-grow flex flex-col">
        <Suspense fallback={<div className="flex-grow flex"><Loader /></div>}>
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
        </Suspense>
      </main>

      {!isAppOnlyRoute && <Footer />}
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
      <ErrorBoundary>
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
      </ErrorBoundary>
    </Router>
  );
}

export default App;