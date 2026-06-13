import { useState, useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { SocketProvider, useSocket } from './contexts/SocketContext';
import { ChatProvider } from './contexts/ChatContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import Sidebar from './components/Sidebar';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from '@/components/ui/sonner';

// Import pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TenantDashboard from './pages/TenantDashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Maintenance from './pages/Maintenance';
import SubmitMaintenance from './pages/SubmitMaintenance';
import RentCalendar from './pages/Calendar';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Reminders from './pages/Reminders';
import PaymentHistory from './pages/PaymentHistory';
import MaintenanceExpenses from './pages/MaintenanceExpenses';
import Communication from './pages/Communication';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TwoFactorAuth from './pages/TwoFactorAuth';
import LoginHistory from './pages/LoginHistory';
import TrustedDevices from './pages/TrustedDevices';
import MyLease from './pages/MyLease';
import MyPayments from './pages/MyPayments';
import Chat from './pages/Chat';
import AcceptInvite from './pages/AcceptInvite';
import { getResetTokenFromUrl } from './lib/passwordResetUtils';

/**
 * Main Router Component
 * Handles routing and page rendering
 */
function AppRouter() {
  const { isAuthenticated, user, loading, logout, login, googleLogin, signup, verify2FA, forcePasswordReset } = useAuth();
  const { 
    properties, 
    tenants, 
    maintenance,
    createProperty,
    updateProperty,
    deleteProperty,
    createTenant,
    updateTenant,
    deleteTenant,
    createMaintenanceRequest,
    updateMaintenanceRequest,
    deleteMaintenanceRequest,
    createPayment,
    updatePayment,
    deletePayment,
  } = useData();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogout = () => {
    logout();
    setCurrentPage('dashboard');
  };

  // ── Silent auto-logout after 15 minutes of inactivity ─────────────────────
  // Only runs when the user is authenticated (never fires on login/signup pages)
  useEffect(() => {
    if (!isAuthenticated) return;

    let idleTimer;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        logout();
        setCurrentPage('dashboard');
      }, 15 * 60 * 1000); // 15 minutes
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(e => document.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach(e => document.removeEventListener(e, resetIdleTimer));
    };
  }, [isAuthenticated]);
  // ──────────────────────────────────────────────────────────────────────────

  // ── Auto-logout if visiting a guest token page while authenticated ────────
  useEffect(() => {
    const path = window.location.pathname;
    if (isAuthenticated && (path === '/reset-password' || path === '/invite/accept')) {
      logout();
    }
  }, [isAuthenticated, logout]);
  // ──────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login/signup if not authenticated
  if (!isAuthenticated) {
    const navigate = (path) => {
      window.location.pathname = path;
    };

    const resetToken = getResetTokenFromUrl();
    const verifyEmail = new URLSearchParams(window.location.search).get('email') || undefined;

    const handleLogin = async (email, password, loginType) => {
      const response = await login(email, password, loginType);

      if (response?.requiresTwoFactor) {
        navigate(`/verify-2fa?email=${encodeURIComponent(email)}`);
      }

      return response;
    };

    const handleGoogleLogin = async (token, loginType) => {
      const response = await googleLogin(token, loginType);

      // We might not know email yet, but we pass generic if requires 2fa
      if (response?.requiresTwoFactor) {
        navigate(`/verify-2fa?email=google-account`); 
      }

      return response;
    };

    const handleSignup = async (fullName, email, password, accountType) => {
      return signup(fullName, email, password, accountType);
    };

    const handleForgotPasswordBack = () => navigate('/login');
    const handleResetDone = () => navigate('/login');

    const handleVerify = async (code) => {
      await verify2FA(code);
      setCurrentPage('dashboard');
      navigate('/');
    };

    const handleSkip2FA = () => {
      logout();
      navigate('/login');
    };

    return (
      <Switch>
        <Route path="/login">
          {() => (
            <Login
              onLogin={handleLogin}
              onGoogleLogin={handleGoogleLogin}
              onSignupClick={() => navigate('/signup')}
              onForgotPassword={() => navigate('/forgot-password')}
              onForcePasswordReset={forcePasswordReset}
            />
          )}
        </Route>
        <Route path="/signup">
          {() => (
            <Signup
              onSignup={handleSignup}
              onLoginClick={() => navigate('/login')}
            />
          )}
        </Route>
        <Route path="/forgot-password">
          {() => (
            <ForgotPassword
              onBack={handleForgotPasswordBack}
              onResetSent={() => {}}
            />
          )}
        </Route>
        <Route path="/reset-password">
          {() => (
            <ResetPassword
              token={new URLSearchParams(window.location.search).get('token')}
              onResetComplete={handleResetDone}
              onBack={handleForgotPasswordBack}
            />
          )}
        </Route>
        <Route path="/verify-2fa">
          {() => (
            <TwoFactorAuth
              onVerify={handleVerify}
              onSkip={handleSkip2FA}
              email={verifyEmail}
              onTrustDevice={undefined}
            />
          )}
        </Route>
        <Route path="/invite/accept">
          {() => (
            <AcceptInvite
              token={new URLSearchParams(window.location.search).get('token')}
            />
          )}
        </Route>
        <Route path="/">
          {() => <Landing />}
        </Route>
        <Route>{() => <Landing />}</Route>
      </Switch>
    );
  }

  // Render current page based on user role
  const renderPage = () => {
    const pageToRender = user?.accountType === 'tenant' && currentPage === 'dashboard' ? 'tenantDashboard' : currentPage;

    switch (pageToRender) {
      case 'dashboard':
        return <Dashboard properties={properties} tenants={tenants} maintenanceRequests={maintenance} onPageChange={setCurrentPage} />;
      case 'tenantDashboard':
        return <TenantDashboard currentUser={user} onPageChange={setCurrentPage} />;
      case 'properties':
        return (
          <Properties 
            properties={properties} 
            onAddProperty={createProperty}
            onUpdateProperty={updateProperty}
            onDeleteProperty={deleteProperty}
          />
        );
      case 'tenants':
        return (
          <Tenants 
            tenants={tenants} 
            properties={properties} 
            onAddTenant={createTenant}
            onUpdateTenant={updateTenant}
            onDeleteTenant={deleteTenant}
          />
        );
      case 'maintenance':
        return (
          <Maintenance 
            maintenanceRequests={maintenance} 
            properties={properties} 
            onUpdateStatus={(id, status) => updateMaintenanceRequest(id, { status })}
            onDeleteRequest={deleteMaintenanceRequest}
          />
        );
      case 'calendar':
        return <RentCalendar tenants={tenants} properties={properties} />;
      case 'analytics':
        return <Analytics properties={properties} tenants={tenants} />;
      case 'reminders':
        return <Reminders tenants={tenants} properties={properties} />;
      case 'paymentHistory':
        return <PaymentHistory tenants={tenants} properties={properties} />;
      case 'maintenanceExpenses':
        return <MaintenanceExpenses maintenanceRequests={maintenance} properties={properties} />;

      case 'reports':
        return <Reports properties={properties} tenants={tenants} maintenanceRequests={maintenance} />;
      case 'loginHistory':
        return <LoginHistory />;
      case 'trustedDevices':
        return <TrustedDevices currentUser={user} />;
      case 'myLease':
        return <MyLease currentUser={user} onPageChange={setCurrentPage} />;
      case 'myPayments':
        return <MyPayments currentUser={user} onPageChange={setCurrentPage} />;
      case 'submitMaintenance':
        return <SubmitMaintenance currentUser={user} onPageChange={setCurrentPage} />;
      case 'chat':
        return user?.accountType === 'owner' ? <Communication tenants={tenants} properties={properties} /> : <Chat />;
      default:
        return <Dashboard properties={properties} tenants={tenants} maintenanceRequests={maintenance} />;
    }
  };

  return (
    <>
      <div className="flex h-screen mesh-bg relative overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} currentUser={user} onLogout={handleLogout} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto w-full min-w-0">
          <div className="p-4 pt-16 md:pt-8 md:p-8 lg:p-10 max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>

        {/* Silent auto-logout after 15 min inactivity — no modal shown */}
      </div>
      <Toaster />
    </>
  );
}

import { HelmetProvider } from 'react-helmet-async';

/**
 * Main App Component
 * Wraps the app with context providers
 */
export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-mock.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <HelmetProvider>
        <AuthProvider>
          <SocketProvider>
            <DataProvider>
              <ChatProvider>
                <TooltipProvider>
                  <AppRouter />
                </TooltipProvider>
              </ChatProvider>
            </DataProvider>
          </SocketProvider>
        </AuthProvider>
      </HelmetProvider>
    </GoogleOAuthProvider>
  );
}
