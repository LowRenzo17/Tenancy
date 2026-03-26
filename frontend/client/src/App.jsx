import { useState, useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { SocketProvider, useSocket } from './contexts/SocketContext';
import { ChatProvider } from './contexts/ChatContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import Sidebar from './components/Sidebar';
import SessionTimeoutWarning from './components/SessionTimeoutWarning';
import NotificationCenter from './components/NotificationCenter';

// Import pages
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

/**
 * Main Router Component
 * Handles routing and page rendering
 */
function AppRouter() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const { properties, tenants, maintenance } = useData();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(60);

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
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/verify-2fa" component={TwoFactorAuth} />
        <Route component={Login} />
      </Switch>
    );
  }

  // Render current page based on user role
  const renderPage = () => {
    const pageToRender = user?.accountType === 'tenant' && currentPage === 'dashboard' ? 'tenantDashboard' : currentPage;

    switch (pageToRender) {
      case 'dashboard':
        return <Dashboard properties={properties} tenants={tenants} maintenanceRequests={maintenance} />;
      case 'tenantDashboard':
        return <TenantDashboard currentUser={user} />;
      case 'properties':
        return <Properties properties={properties} />;
      case 'tenants':
        return <Tenants tenants={tenants} properties={properties} />;
      case 'maintenance':
        return <Maintenance maintenanceRequests={maintenance} properties={properties} />;
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
      case 'communication':
        return <Communication tenants={tenants} properties={properties} />;
      case 'reports':
        return <Reports properties={properties} tenants={tenants} maintenanceRequests={maintenance} />;
      case 'loginHistory':
        return <LoginHistory />;
      case 'trustedDevices':
        return <TrustedDevices currentUser={user} />;
      case 'myLease':
        return <MyLease currentUser={user} />;
      case 'myPayments':
        return <MyPayments currentUser={user} />;
      case 'submitMaintenance':
        return <SubmitMaintenance currentUser={user} />;
      case 'chat':
        return <Chat />;
      default:
        return <Dashboard properties={properties} tenants={tenants} maintenanceRequests={maintenance} />;
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('dashboard');
  };

  const handleSessionTimeout = () => {
    setShowSessionWarning(true);
    setSessionTimeRemaining(60);
  };

  const handleExtendSession = () => {
    setShowSessionWarning(false);
  };

  // Handle session warning timeout
  useEffect(() => {
    if (!showSessionWarning) return;
    if (sessionTimeRemaining <= 0) {
      handleLogout();
      return;
    }
    const timer = setTimeout(() => {
      setSessionTimeRemaining(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [showSessionWarning, sessionTimeRemaining]);

  return (
    <>
      <div className="flex h-screen" style={{ backgroundColor: '#f3faff' }}>
        {/* Sidebar Navigation */}
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} currentUser={user} onLogout={handleLogout} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto md:ml-0">
          <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>

        {/* Session Timeout Warning */}
        <SessionTimeoutWarning
          isVisible={showSessionWarning}
          timeRemaining={sessionTimeRemaining}
          onExtend={handleExtendSession}
          onLogout={handleLogout}
        />
      </div>
      <NotificationCenter />
    </>
  );
}

/**
 * Main App Component
 * Wraps the app with context providers
 */
export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <SocketProvider>
          <ChatProvider>
            <TooltipProvider>
              <AppRouter />
            </TooltipProvider>
          </ChatProvider>
        </SocketProvider>
      </DataProvider>
    </AuthProvider>
  );
}
