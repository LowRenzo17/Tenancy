import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Maintenance from './pages/Maintenance';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Reminders from './pages/Reminders';
import PaymentHistory from './pages/PaymentHistory';
import MaintenanceExpenses from './pages/MaintenanceExpenses';
import Communication from './pages/Communication';
import Reports from './pages/Reports';
import Signup from './pages/Signup';
import Login from './pages/Login';
import { useLocalStorage } from './hooks/useLocalStorage';

/**
 * Main App Component
 * Design System: The Architectural Ledger
 * - Sidebar navigation with responsive collapse
 * - Page routing via state management
 * - localStorage persistence for all data
 */
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage('tenancy_auth', false);
  const [currentUser, setCurrentUser] = useLocalStorage('tenancy_user', null);
  const [showLogin, setShowLogin] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [properties, setProperties] = useLocalStorage('tenancy_properties', []);
  const [tenants, setTenants] = useLocalStorage('tenancy_tenants', []);
  const [maintenanceRequests, setMaintenanceRequests] = useLocalStorage('tenancy_maintenance', []);

  // Add new property
  const handleAddProperty = (property) => {
    setProperties([...properties, property]);
  };

  // Delete property
  const handleDeleteProperty = (id) => {
    setProperties(properties.filter(p => p.id !== id));
    // Also remove associated tenants
    setTenants(tenants.filter(t => t.propertyId !== id));
    // Also remove associated maintenance requests
    setMaintenanceRequests(maintenanceRequests.filter(r => r.propertyId !== id));
  };

  // Update property
  const handleUpdateProperty = (id, updatedData) => {
    setProperties(properties.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  // Add new tenant
  const handleAddTenant = (tenant) => {
    setTenants([...tenants, tenant]);
  };

  // Delete tenant
  const handleDeleteTenant = (id) => {
    setTenants(tenants.filter(t => t.id !== id));
  };

  // Update tenant
  const handleUpdateTenant = (id, updatedData) => {
    setTenants(tenants.map(t => t.id === id ? { ...t, ...updatedData } : t));
  };

  // Add maintenance request
  const handleAddRequest = (request) => {
    setMaintenanceRequests([...maintenanceRequests, request]);
  };

  // Delete maintenance request
  const handleDeleteRequest = (id) => {
    setMaintenanceRequests(maintenanceRequests.filter(r => r.id !== id));
  };

  // Update maintenance request status
  const handleUpdateStatus = (id, newStatus) => {
    setMaintenanceRequests(
      maintenanceRequests.map(r => r.id === id ? { ...r, status: newStatus } : r)
    );
  };

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            properties={properties}
            tenants={tenants}
            maintenanceRequests={maintenanceRequests}
          />
        );
      case 'properties':
        return (
          <Properties
            properties={properties}
            onAddProperty={handleAddProperty}
            onDeleteProperty={handleDeleteProperty}
            onUpdateProperty={handleUpdateProperty}
          />
        );
      case 'tenants':
        return (
          <Tenants
            tenants={tenants}
            properties={properties}
            onAddTenant={handleAddTenant}
            onDeleteTenant={handleDeleteTenant}
            onUpdateTenant={handleUpdateTenant}
          />
        );
      case 'maintenance':
        return (
          <Maintenance
            maintenanceRequests={maintenanceRequests}
            properties={properties}
            onAddRequest={handleAddRequest}
            onDeleteRequest={handleDeleteRequest}
            onUpdateStatus={handleUpdateStatus}
          />
        );
      case 'calendar':
        return (
          <Calendar
            tenants={tenants}
            properties={properties}
          />
        );
      case 'analytics':
        return (
          <Analytics
            properties={properties}
            tenants={tenants}
          />
        );
      case 'reminders':
        return (
          <Reminders
            tenants={tenants}
            properties={properties}
          />
        );
      case 'paymentHistory':
        return (
          <PaymentHistory
            tenants={tenants}
            properties={properties}
          />
        );
      case 'maintenanceExpenses':
        return (
          <MaintenanceExpenses
            maintenanceRequests={maintenanceRequests}
            properties={properties}
          />
        );
      case 'communication':
        return (
          <Communication
            tenants={tenants}
            properties={properties}
          />
        );
      case 'reports':
        return (
          <Reports
            properties={properties}
            tenants={tenants}
            maintenanceRequests={maintenanceRequests}
          />
        );
      default:
        return null;
    }
  };

  // Handle signup
  const handleSignup = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setShowLogin(false);
    setCurrentPage('dashboard');
  };

  // Handle login
  const handleLogin = (credentials) => {
    setCurrentUser({
      email: credentials.email,
      accountType: credentials.accountType,
    });
    setIsAuthenticated(true);
    setShowLogin(false);
    setCurrentPage('dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowLogin(false);
    setCurrentPage('dashboard');
  };

  // Show login page if requested
  if (showLogin) {
    return (
      <Login
        onLogin={handleLogin}
        onSignupClick={() => {
          setShowLogin(false);
          setIsAuthenticated(false);
        }}
      />
    );
  }

  // Show signup page if not authenticated
  if (!isAuthenticated) {
    return (
      <Signup
        onSignup={handleSignup}
        onLoginClick={() => setShowLogin(true)}
      />
    );
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#f3faff' }}>
      {/* Sidebar Navigation */}
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} currentUser={currentUser} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
