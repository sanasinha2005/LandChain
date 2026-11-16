import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Pages (All 17 Required Pages)
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import CitizenDashboard from './pages/CitizenDashboard';
import RegistrarDashboard from './pages/RegistrarDashboard';
import LandRegistrationPage from './pages/LandRegistrationPage';
import MyPropertiesPage from './pages/MyPropertiesPage';
import SearchLandRecordsPage from './pages/SearchLandRecordsPage';
import LandDetailsPage from './pages/LandDetailsPage';
import OwnershipTransferPage from './pages/OwnershipTransferPage';
import OwnershipHistoryPage from './pages/OwnershipHistoryPage';
import PendingRegistrationsPage from './pages/PendingRegistrationsPage';
import PendingTransfersPage from './pages/PendingTransfersPage';
import BlockchainTransactionsPage from './pages/BlockchainTransactionsPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import UserProfilePage from './pages/UserProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Guard
function ProtectedRoute({ children, roleRequired }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Authenticating with Government Identity Service..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roleRequired && user?.role !== roleRequired) {
    // If citizen tries to access registrar, send to citizen dashboard; and vice versa
    return <Navigate to={user?.role === 'registrar' ? '/registrar/dashboard' : '/dashboard'} replace />;
  }

  return children;
}

// App Layout Handler
function AppLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Public standalone pages that don't need the dashboard sidebar
  const isPublicPage = location.pathname === '/' || 
                       location.pathname === '/login' || 
                       location.pathname === '/register';

  const showSidebar = isAuthenticated && !isPublicPage;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      
      <div className="flex-1 flex w-full">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 transition-all ${showSidebar ? 'p-4 sm:p-6 lg:p-8 max-w-7xl' : 'w-full'}`}>
          <Routes>
            {/* 1. Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* 2. Citizen Registration */}
            <Route path="/register" element={<RegisterPage />} />

            {/* 3. Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* 4. Citizen Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roleRequired="citizen">
                  <CitizenDashboard />
                </ProtectedRoute>
              }
            />

            {/* 5. Registrar Dashboard */}
            <Route
              path="/registrar/dashboard"
              element={
                <ProtectedRoute roleRequired="registrar">
                  <RegistrarDashboard />
                </ProtectedRoute>
              }
            />

            {/* 6. Land Registration */}
            <Route
              path="/register-land"
              element={
                <ProtectedRoute roleRequired="citizen">
                  <LandRegistrationPage />
                </ProtectedRoute>
              }
            />

            {/* 7. My Properties */}
            <Route
              path="/my-properties"
              element={
                <ProtectedRoute>
                  <MyPropertiesPage />
                </ProtectedRoute>
              }
            />

            {/* 8. Search Land Records */}
            <Route path="/search" element={<SearchLandRecordsPage />} />

            {/* 9. Land Details */}
            <Route path="/land/:landId" element={<LandDetailsPage />} />

            {/* 10. Ownership Transfer */}
            <Route
              path="/transfer"
              element={
                <ProtectedRoute roleRequired="citizen">
                  <OwnershipTransferPage />
                </ProtectedRoute>
              }
            />

            {/* 11. Ownership History */}
            <Route path="/history" element={<OwnershipHistoryPage />} />

            {/* 12. Pending Registration Requests */}
            <Route
              path="/registrar/pending-registrations"
              element={
                <ProtectedRoute roleRequired="registrar">
                  <PendingRegistrationsPage />
                </ProtectedRoute>
              }
            />

            {/* 13. Pending Transfer Requests */}
            <Route
              path="/registrar/pending-transfers"
              element={
                <ProtectedRoute roleRequired="registrar">
                  <PendingTransfersPage />
                </ProtectedRoute>
              }
            />

            {/* 14. Blockchain Transactions */}
            <Route path="/transactions" element={<BlockchainTransactionsPage />} />

            {/* 15. Activity Logs */}
            <Route
              path="/activity-logs"
              element={
                <ProtectedRoute>
                  <ActivityLogsPage />
                </ProtectedRoute>
              }
            />

            {/* 16. User Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />

            {/* 17. 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

