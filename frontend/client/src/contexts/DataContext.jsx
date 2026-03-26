import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../lib/api';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // Properties
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [propertiesError, setPropertiesError] = useState(null);

  // Tenants
  const [tenants, setTenants] = useState([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [tenantsError, setTenantsError] = useState(null);

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
        setProperties(response.properties || []);
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
        setTenants(response.tenants || []);
      }
    } catch (err) {
      setTenantsError(err.message);
      console.error('Error fetching tenants:', err);
    } finally {
      setTenantsLoading(false);
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
        setProperties([...properties, response.property]);
        return response.property;
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
        setProperties(properties.map((p) => (p._id === id ? response.property : p)));
        return response.property;
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
        setTenants([...tenants, response.tenant]);
        return response.tenant;
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
        setTenants(tenants.map((t) => (t._id === id ? response.tenant : t)));
        return response.tenant;
      }
    } catch (err) {
      console.error('Error updating tenant:', err);
      throw err;
    }
  };

  // Delete tenant
  const deleteTenant = async (id) => {
    try {
      const response = await apiClient.deleteTenant(id);
      if (response.success) {
        setTenants(tenants.filter((t) => t._id !== id));
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
        setMaintenance(maintenance.map((m) => (m._id === id ? response.maintenance : m)));
        return response.maintenance;
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
      }
      fetchMaintenance();
      fetchPayments();
    }
  }, [isAuthenticated, user]);

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
    deleteTenant,

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
