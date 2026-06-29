import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../lib/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { socket } = useSocket();

  // Properties
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [propertiesError, setPropertiesError] = useState(null);

  // Tenants
  const [tenants, setTenants] = useState([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [tenantsError, setTenantsError] = useState(null);

  const [myTenantProfile, setMyTenantProfile] = useState(null);
  const [myTenantProfileLoading, setMyTenantProfileLoading] = useState(false);
  const [myTenantProfileError, setMyTenantProfileError] = useState(null);

  // Maintenance
  const [maintenance, setMaintenance] = useState([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [maintenanceError, setMaintenanceError] = useState(null);

  // Payments
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState(null);

  // Analytics
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  // Fetch properties
  const fetchProperties = async () => {
    if (!isAuthenticated || user?.accountType !== 'owner') return;

    try {
      setPropertiesLoading(true);
      setPropertiesError(null);
      const response = await apiClient.getProperties();
      if (response.success) {
        const rawList = response.properties || [];
        const normalized = rawList.map(p => ({
          ...p,
          id: p._id || p.id,
          status: p.occupancyStatus || p.status || 'vacant'
        }));
        setProperties(normalized);
      }
    } catch (err) {
      setPropertiesError(err.message);
      console.error('Error fetching properties:', err);
    } finally {
      setPropertiesLoading(false);
    }
  };

  // Fetch tenants
  const fetchTenants = async () => {
    if (!isAuthenticated || user?.accountType !== 'owner') return;

    try {
      setTenantsLoading(true);
      setTenantsError(null);
      const response = await apiClient.getTenants();
      if (response.success) {
        const rawList = response.tenants || [];
        const normalized = rawList.map(t => ({
          ...t,
          id: t._id || t.id,
          name: t.fullName || t.name,
          rentAmount: t.monthlyRent || t.rentAmount || 0,
        }));
        setTenants(normalized);
      }
    } catch (err) {
      setTenantsError(err.message);
      console.error('Error fetching tenants:', err);
    } finally {
      setTenantsLoading(false);
    }
  };

  // Fetch my tenant profile
  const fetchMyTenantProfile = async () => {
    if (!isAuthenticated || user?.accountType !== 'tenant') return;

    try {
      setMyTenantProfileLoading(true);
      setMyTenantProfileError(null);
      const response = await apiClient.getMyTenantProfile();
      if (response.success) {
        setMyTenantProfile(response.tenant);
      }
    } catch (err) {
      setMyTenantProfileError(err.message);
      console.error('Error fetching my tenant profile:', err);
    } finally {
      setMyTenantProfileLoading(false);
    }
  };

  // Fetch maintenance
  const fetchMaintenance = async () => {
    if (!isAuthenticated) return;

    try {
      setMaintenanceLoading(true);
      setMaintenanceError(null);
      const response = await apiClient.getMaintenance();
      if (response.success) {
        setMaintenance(response.maintenance || []);
      }
    } catch (err) {
      setMaintenanceError(err.message);
      console.error('Error fetching maintenance:', err);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  // Fetch payments
  const fetchPayments = async () => {
    if (!isAuthenticated) return;

    try {
      setPaymentsLoading(true);
      setPaymentsError(null);
      const response = await apiClient.getPayments();
      if (response.success) {
        setPayments(response.payments || []);
      }
    } catch (err) {
      setPaymentsError(err.message);
      console.error('Error fetching payments:', err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    if (!isAuthenticated || user?.accountType !== 'owner') return;

    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      const response = await apiClient.getDashboardAnalytics();
      if (response.success) {
        setAnalytics(response.analytics);
      }
    } catch (err) {
      setAnalyticsError(err.message);
      console.error('Error fetching analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Create property
  const createProperty = async (data) => {
    try {
      const response = await apiClient.createProperty(data);
      if (response.success) {
        const p = response.property;
        const normalized = {
          ...p,
          id: p._id || p.id,
          status: p.occupancyStatus || p.status || 'vacant'
        };
        setProperties([...properties, normalized]);
        return normalized;
      }
    } catch (err) {
      console.error('Error creating property:', err);
      throw err;
    }
  };

  // Update property
  const updateProperty = async (id, data) => {
    try {
      const response = await apiClient.updateProperty(id, data);
      if (response.success) {
        const p = response.property;
        const normalized = {
          ...p,
          id: p._id || p.id,
          status: p.occupancyStatus || p.status || 'vacant'
        };
        setProperties(properties.map((prop) => (prop.id === id || prop._id === id ? normalized : prop)));
        return normalized;
      }
    } catch (err) {
      console.error('Error updating property:', err);
      throw err;
    }
  };

  // Delete property
  const deleteProperty = async (id) => {
    try {
      const response = await apiClient.deleteProperty(id);
      if (response.success) {
        setProperties(properties.filter((p) => p._id !== id));
        return response;
      }
    } catch (err) {
      console.error('Error deleting property:', err);
      throw err;
    }
  };

  // Create tenant
  const createTenant = async (data) => {
    try {
      const response = await apiClient.createTenant(data);
      if (response.success) {
        const t = response.tenant;
        const normalized = {
          ...t,
          id: t._id || t.id,
          name: t.fullName || t.name,
          rentAmount: t.monthlyRent || t.rentAmount || 0,
          emailDelivery: response.emailDelivery,
        };
        setTenants([...tenants, normalized]);
        
        // Emit socket event for real-time updates
        if (socket) {
          socket.emit('tenant-created', normalized);
        }
        
        return normalized;
      }
    } catch (err) {
      console.error('Error creating tenant:', err);
      throw err;
    }
  };

  // Update tenant
  const updateTenant = async (id, data) => {
    try {
      const response = await apiClient.updateTenant(id, data);
      if (response.success) {
        const t = response.tenant;
        const normalized = {
          ...t,
          id: t._id || t.id,
          name: t.fullName || t.name,
          rentAmount: t.monthlyRent || t.rentAmount || 0,
        };
        setTenants(tenants.map((ten) => (ten.id === id || ten._id === id ? normalized : ten)));
        
        // Emit socket event for real-time updates
        if (socket) {
          socket.emit('tenant-updated', normalized);
        }
        
        return normalized;
      }
    } catch (err) {
      console.error('Error updating tenant:', err);
      throw err;
    }
  };

  const sendRentReminder = async (id, data = {}) => {
    try {
      return await apiClient.sendRentReminder(id, data);
    } catch (err) {
      console.error('Error sending rent reminder:', err);
      throw err;
    }
  };

  // Delete tenant
  const deleteTenant = async (id) => {
    try {
      const response = await apiClient.deleteTenant(id);
      if (response.success) {
        const tenantToDelete = tenants.find(t => t._id === id || t.id === id);
        setTenants(tenants.filter((t) => t._id !== id));
        
        // Emit socket event for real-time updates
        if (socket && tenantToDelete) {
          socket.emit('tenant-deleted', tenantToDelete);
        }
        
        return response;
      }
    } catch (err) {
      console.error('Error deleting tenant:', err);
      throw err;
    }
  };

  // Create maintenance request
  const createMaintenanceRequest = async (data) => {
    try {
      const response = await apiClient.createMaintenanceRequest(data);
      if (response.success) {
        setMaintenance([...maintenance, response.maintenance]);
        return response.maintenance;
      }
    } catch (err) {
      console.error('Error creating maintenance request:', err);
      throw err;
    }
  };

  // Update maintenance request
  const updateMaintenanceRequest = async (id, data) => {
    try {
      const response = await apiClient.updateMaintenanceRequest(id, data);
      if (response.success) {
        if (response.deleted) {
          setMaintenance(maintenance.filter((m) => m._id !== id && m.id !== id));
          return null;
        } else {
          setMaintenance(maintenance.map((m) => (m._id === id ? response.maintenance : m)));
          return response.maintenance;
        }
      }
    } catch (err) {
      console.error('Error updating maintenance request:', err);
      throw err;
    }
  };

  // Delete maintenance request
  const deleteMaintenanceRequest = async (id) => {
    try {
      const response = await apiClient.deleteMaintenanceRequest(id);
      if (response.success) {
        setMaintenance(maintenance.filter((m) => m._id !== id));
        return response;
      }
    } catch (err) {
      console.error('Error deleting maintenance request:', err);
      throw err;
    }
  };

  // Create payment
  const createPayment = async (data) => {
    try {
      const response = await apiClient.createPayment(data);
      if (response.success) {
        setPayments([...payments, response.payment]);
        return response.payment;
      }
    } catch (err) {
      console.error('Error creating payment:', err);
      throw err;
    }
  };

  // Submit tenant payment
  const submitPayment = async (data) => {
    try {
      const response = await apiClient.submitTenantPayment(data);
      if (response.success) {
        await fetchMyTenantProfile();
        return response.payment;
      }
    } catch (err) {
      console.error('Error submitting payment:', err);
      throw err;
    }
  };

  // Update payment
  const updatePayment = async (id, data) => {
    try {
      const response = await apiClient.updatePayment(id, data);
      if (response.success) {
        setPayments(payments.map((p) => (p._id === id ? response.payment : p)));
        return response.payment;
      }
    } catch (err) {
      console.error('Error updating payment:', err);
      throw err;
    }
  };

  // Delete payment
  const deletePayment = async (id) => {
    try {
      const response = await apiClient.deletePayment(id);
      if (response.success) {
        setPayments(payments.filter((p) => p._id !== id));
        return response;
      }
    } catch (err) {
      console.error('Error deleting payment:', err);
      throw err;
    }
  };

  // Initial data fetch when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.accountType === 'owner') {
        fetchProperties();
        fetchTenants();
        fetchAnalytics();
      } else if (user?.accountType === 'tenant') {
        fetchMyTenantProfile();
      }
      fetchMaintenance();
      fetchPayments();
    }
  }, [isAuthenticated, user]);

  // Socket.io listeners for real-time data updates
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    // Property events
    const handlePropertyCreated = (data) => {
      if (user?.accountType === 'owner') {
        const normalized = {
          ...data,
          id: data._id || data.id,
          status: data.occupancyStatus || data.status || 'vacant'
        };
        setProperties(prev => [...prev, normalized]);
      }
    };

    const handlePropertyUpdated = (data) => {
      if (user?.accountType === 'owner') {
        const normalized = {
          ...data,
          id: data._id || data.id,
          status: data.occupancyStatus || data.status || 'vacant'
        };
        setProperties(prev => 
          prev.map(p => (p._id === data._id || p.id === data._id) ? normalized : p)
        );
      }
    };

    const handlePropertyDeleted = (data) => {
      if (user?.accountType === 'owner') {
        setProperties(prev => prev.filter(p => p._id !== data.propertyId));
      }
    };

    // Tenant events
    const handleTenantCreated = (data) => {
      if (user?.accountType === 'owner') {
        const normalized = {
          ...data,
          id: data._id || data.id,
          name: data.fullName || data.name,
          rentAmount: data.monthlyRent || data.rentAmount || 0,
        };
        setTenants(prev => [...prev, normalized]);
      }
    };

    const handleTenantUpdated = (data) => {
      if (user?.accountType === 'owner') {
        const normalized = {
          ...data,
          id: data._id || data.id,
          name: data.fullName || data.name,
          rentAmount: data.monthlyRent || data.rentAmount || 0,
        };
        setTenants(prev =>
          prev.map(t => (t._id === data._id || t.id === data._id) ? normalized : t)
        );
      }
    };

    const handleTenantDeleted = (data) => {
      if (user?.accountType === 'owner') {
        setTenants(prev => prev.filter(t => t._id !== data.tenantId));
      }
    };

    const handleTenantProfileUpdated = (data) => {
      if (user?.accountType === 'tenant') {
        setMyTenantProfile(data);
      }
    };

    // Maintenance events
    const handleMaintenanceCreated = (data) => {
      setMaintenance(prev => [...prev, data]);
    };

    const handleMaintenanceUpdated = (data) => {
      setMaintenance(prev =>
        prev.map(m => (m._id === data._id) ? data : m)
      );
    };

    const handleMaintenanceDeleted = (data) => {
      setMaintenance(prev => prev.filter(m => m._id !== data.maintenanceId));
    };

    // Payment events
    const handlePaymentCreated = (data) => {
      setPayments(prev => [...prev, data]);
    };

    const handlePaymentUpdated = (data) => {
      setPayments(prev =>
        prev.map(p => (p._id === data._id) ? data : p)
      );
      // Also update tenant profile if it's the current user
      if (user?.accountType === 'tenant') {
        fetchMyTenantProfile();
      }
    };

    const handlePaymentDeleted = (data) => {
      setPayments(prev => prev.filter(p => p._id !== data.paymentId));
      // Also update tenant profile if it's the current user
      if (user?.accountType === 'tenant') {
        fetchMyTenantProfile();
      }
    };

    // Analytics events
    const handleAnalyticsUpdated = (data) => {
      if (user?.accountType === 'owner') {
        setAnalytics(data);
      }
    };

    // Register all listeners
    socket.on('property-created', handlePropertyCreated);
    socket.on('property-updated', handlePropertyUpdated);
    socket.on('property-deleted', handlePropertyDeleted);
    socket.on('tenant-created', handleTenantCreated);
    socket.on('tenant-updated', handleTenantUpdated);
    socket.on('tenant-deleted', handleTenantDeleted);
    socket.on('tenant-profile-updated', handleTenantProfileUpdated);
    socket.on('maintenance-created', handleMaintenanceCreated);
    socket.on('maintenance-updated', handleMaintenanceUpdated);
    socket.on('maintenance-deleted', handleMaintenanceDeleted);
    socket.on('payment-created', handlePaymentCreated);
    socket.on('payment-updated', handlePaymentUpdated);
    socket.on('payment-deleted', handlePaymentDeleted);
    socket.on('analytics-updated', handleAnalyticsUpdated);

    // Cleanup
    return () => {
      socket.off('property-created', handlePropertyCreated);
      socket.off('property-updated', handlePropertyUpdated);
      socket.off('property-deleted', handlePropertyDeleted);
      socket.off('tenant-created', handleTenantCreated);
      socket.off('tenant-updated', handleTenantUpdated);
      socket.off('tenant-deleted', handleTenantDeleted);
      socket.off('tenant-profile-updated', handleTenantProfileUpdated);
      socket.off('maintenance-created', handleMaintenanceCreated);
      socket.off('maintenance-updated', handleMaintenanceUpdated);
      socket.off('maintenance-deleted', handleMaintenanceDeleted);
      socket.off('payment-created', handlePaymentCreated);
      socket.off('payment-updated', handlePaymentUpdated);
      socket.off('payment-deleted', handlePaymentDeleted);
      socket.off('analytics-updated', handleAnalyticsUpdated);
    };
  }, [socket, isAuthenticated, user?.accountType]);

  const value = {
    // Properties
    properties,
    propertiesLoading,
    propertiesError,
    fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty,

    // Tenants
    tenants,
    tenantsLoading,
    tenantsError,
    fetchTenants,
    createTenant,
    updateTenant,
    sendRentReminder,
    deleteTenant,
    myTenantProfile,
    myTenantProfileLoading,
    myTenantProfileError,
    fetchMyTenantProfile,

    // Maintenance
    maintenance,
    maintenanceLoading,
    maintenanceError,
    fetchMaintenance,
    createMaintenanceRequest,
    updateMaintenanceRequest,
    deleteMaintenanceRequest,

    // Payments
    payments,
    paymentsLoading,
    paymentsError,
    fetchPayments,
    createPayment,
    submitPayment,
    updatePayment,
    deletePayment,

    // Analytics
    analytics,
    analyticsLoading,
    analyticsError,
    fetchAnalytics,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
