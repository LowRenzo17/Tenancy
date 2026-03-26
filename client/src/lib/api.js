/**
 * API Client for Tenancy Slate Backend
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  /**
   * Get authentication token
   */
  getToken() {
    return this.token || localStorage.getItem('token');
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // ============ AUTH ENDPOINTS ============

  signup(data) {
    return this.post('/auth/signup', data);
  }

  login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  verify2FA(code) {
    return this.post('/auth/verify-2fa', { code });
  }

  enable2FA() {
    return this.post('/auth/enable-2fa', {});
  }

  confirm2FA(secret, code, backupCodes) {
    return this.post('/auth/confirm-2fa', { secret, code, backupCodes });
  }

  disable2FA() {
    return this.post('/auth/disable-2fa', {});
  }

  forgotPassword(email) {
    return this.post('/auth/forgot-password', { email });
  }

  resetPassword(token, password) {
    return this.post('/auth/reset-password', { token, password });
  }

  getCurrentUser() {
    return this.get('/auth/me');
  }

  updateProfile(data) {
    return this.put('/auth/update-profile', data);
  }

  getLoginHistory() {
    return this.get('/auth/login-history');
  }

  getTrustedDevices() {
    return this.get('/auth/trusted-devices');
  }

  addTrustedDevice(data) {
    return this.post('/auth/add-trusted-device', data);
  }

  removeTrustedDevice(deviceId) {
    return this.delete(`/auth/trusted-devices/${deviceId}`);
  }

  // ============ PROPERTY ENDPOINTS ============

  getProperties() {
    return this.get('/properties');
  }

  getProperty(id) {
    return this.get(`/properties/${id}`);
  }

  createProperty(data) {
    return this.post('/properties', data);
  }

  updateProperty(id, data) {
    return this.put(`/properties/${id}`, data);
  }

  deleteProperty(id) {
    return this.delete(`/properties/${id}`);
  }

  getPropertyMaintenanceHistory(id) {
    return this.get(`/properties/${id}/maintenance-history`);
  }

  // ============ TENANT ENDPOINTS ============

  getTenants() {
    return this.get('/tenants');
  }

  getTenant(id) {
    return this.get(`/tenants/${id}`);
  }

  createTenant(data) {
    return this.post('/tenants', data);
  }

  updateTenant(id, data) {
    return this.put(`/tenants/${id}`, data);
  }

  deleteTenant(id) {
    return this.delete(`/tenants/${id}`);
  }

  getTenantPaymentHistory(id) {
    return this.get(`/tenants/${id}/payment-history`);
  }

  updateTenantRentStatus(id, rentStatus) {
    return this.put(`/tenants/${id}/rent-status`, { rentStatus });
  }

  // ============ MAINTENANCE ENDPOINTS ============

  getMaintenance() {
    return this.get('/maintenance');
  }

  getMaintenanceRequest(id) {
    return this.get(`/maintenance/${id}`);
  }

  createMaintenanceRequest(data) {
    return this.post('/maintenance', data);
  }

  updateMaintenanceRequest(id, data) {
    return this.put(`/maintenance/${id}`, data);
  }

  deleteMaintenanceRequest(id) {
    return this.delete(`/maintenance/${id}`);
  }

  getPropertyMaintenance(propertyId) {
    return this.get(`/maintenance/property/${propertyId}`);
  }

  // ============ PAYMENT ENDPOINTS ============

  getPayments() {
    return this.get('/payments');
  }

  getPayment(id) {
    return this.get(`/payments/${id}`);
  }

  createPayment(data) {
    return this.post('/payments', data);
  }

  updatePayment(id, data) {
    return this.put(`/payments/${id}`, data);
  }

  deletePayment(id) {
    return this.delete(`/payments/${id}`);
  }

  getTenantPayments(tenantId) {
    return this.get(`/payments/tenant/${tenantId}`);
  }

  getPropertyPayments(propertyId) {
    return this.get(`/payments/property/${propertyId}`);
  }

  // ============ MESSAGE ENDPOINTS ============

  getConversations() {
    return this.get('/messages/conversations');
  }

  getConversation(conversationId) {
    return this.get(`/messages/conversations/${conversationId}`);
  }

  createConversation(data) {
    return this.post('/messages/conversations', data);
  }

  getMessages(conversationId) {
    return this.get(`/messages/${conversationId}`);
  }

  sendMessage(data) {
    return this.post('/messages', data);
  }

  updateMessage(id, data) {
    return this.put(`/messages/${id}`, data);
  }

  deleteMessage(id) {
    return this.delete(`/messages/${id}`);
  }

  archiveConversation(conversationId) {
    return this.put(`/messages/conversation/${conversationId}/archive`, {});
  }

  // ============ ANALYTICS ENDPOINTS ============

  getDashboardAnalytics() {
    return this.get('/analytics/dashboard');
  }

  getRevenueAnalytics(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.get(`/analytics/revenue?${params}`);
  }

  getOccupancyAnalytics() {
    return this.get('/analytics/occupancy');
  }

  getMaintenanceAnalytics() {
    return this.get('/analytics/maintenance');
  }

  getTenantRentStatusAnalytics() {
    return this.get('/analytics/tenant-rent-status');
  }

  getPropertyAnalytics(propertyId) {
    return this.get(`/analytics/property/${propertyId}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

export default apiClient;
