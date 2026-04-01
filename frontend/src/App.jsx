import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerListing from './pages/WorkerListing';
import Booking from './pages/Booking';
import CustomerDashboard from './pages/CustomerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import WorkerPerformanceDashboard from './pages/WorkerPerformanceDashboard';
import CommunitySubscriptionsPage from './pages/CommunitySubscriptionsPage';
import ProfilePage from './pages/ProfilePage';
import DashboardLayout from './components/DashboardLayout';
import WorkerProfile from './pages/WorkerProfile';
import ForgotPassword from './pages/ForgotPassword';
import Community from './pages/Community';
import GoogleTranslateManager from './components/GoogleTranslateManager';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

const OptionalDashboardLayout = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user ? <DashboardLayout>{children}</DashboardLayout> : children;
};

const PrivateRoute = ({ children, role }) => {
  const isAdminPortal = import.meta.env.VITE_ADMIN_PORTAL === 'true';
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to={isAdminPortal ? '/login' : '/'} />;
  return children;
};

const AdminPortalGuard = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.role === 'Admin') return <Navigate to="/dashboard/admin" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  const isAdminPortal = import.meta.env.VITE_ADMIN_PORTAL === 'true';

  if (isAdminPortal) {
    return (
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<AdminPortalGuard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard/admin" element={<PrivateRoute role="Admin"><DashboardLayout><AdminDashboard /></DashboardLayout></PrivateRoute>} />
            <Route path="/dashboard/admin/analytics" element={<PrivateRoute role="Admin"><DashboardLayout><AnalyticsDashboard /></DashboardLayout></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute role="Admin"><DashboardLayout><ProfilePage /></DashboardLayout></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
        </Router>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleTranslateManager />
      <Router>
        <AppRoutes />
        <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
      </Router>
    </QueryClientProvider>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isWorkspaceRoute =
    location.pathname.startsWith('/dashboard/') ||
    location.pathname === '/profile' ||
    location.pathname === '/book' ||
    location.pathname.startsWith('/book/');

  return (
    <>
      {!isWorkspaceRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<OptionalDashboardLayout><Home /></OptionalDashboardLayout>} />
        <Route path="/community" element={<OptionalDashboardLayout><Community /></OptionalDashboardLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/workers" element={<OptionalDashboardLayout><WorkerListing /></OptionalDashboardLayout>} />
        <Route path="/book" element={<PrivateRoute role="Customer"><DashboardLayout><Booking /></DashboardLayout></PrivateRoute>} />
        <Route path="/book/:workerId" element={<PrivateRoute role="Customer"><DashboardLayout><Booking /></DashboardLayout></PrivateRoute>} />
        <Route path="/worker/:id" element={<OptionalDashboardLayout><WorkerProfile /></OptionalDashboardLayout>} />
        <Route path="/dashboard/customer" element={<PrivateRoute role="Customer"><DashboardLayout><CustomerDashboard /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/worker" element={<PrivateRoute role="Worker"><DashboardLayout><WorkerDashboard /></DashboardLayout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><DashboardLayout><ProfilePage /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/worker/performance" element={<PrivateRoute role="Worker"><DashboardLayout><WorkerPerformanceDashboard /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/customer/subscriptions" element={<PrivateRoute role="Customer"><DashboardLayout><CommunitySubscriptionsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/admin/*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;
