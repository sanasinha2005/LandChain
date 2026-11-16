const API_BASE = '/api';

/**
 * Universal fetch wrapper with auto authorization header
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('landchain_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request('/auth/me'),
    updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
    lookupUser: (email) => request(`/auth/lookup-user?email=${encodeURIComponent(email)}`),
  },

  // Land Records & Blockchain
  land: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/land${query ? `?${query}` : ''}`);
    },
    getDetails: (landId) => request(`/land/${encodeURIComponent(landId)}`),
    getHistory: (landId) => request(`/land/${encodeURIComponent(landId)}/history`),
    verify: (landId) => request(`/land/${encodeURIComponent(landId)}/verify`),
    getMyProperties: () => request('/land/my-properties'),
    getMyRequests: () => request('/land/my-requests'),
    submitRequest: (landData) => request('/land/request', { method: 'POST', body: JSON.stringify(landData) }),
  },

  // Ownership Transfers
  transfer: {
    submitRequest: (transferData) => request('/transfer/request', { method: 'POST', body: JSON.stringify(transferData) }),
    getMyRequests: () => request('/transfer/my-requests'),
  },

  // Registrar Operations
  registrar: {
    getPendingRegistrations: () => request('/registrar/pending-registrations'),
    approveRegistration: (requestId) => request(`/registrar/approve-registration/${requestId}`, { method: 'POST' }),
    rejectRegistration: (requestId, reason) => request(`/registrar/reject-registration/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),
    getPendingTransfers: () => request('/registrar/pending-transfers'),
    approveTransfer: (requestId) => request(`/registrar/approve-transfer/${requestId}`, { method: 'POST' }),
    rejectTransfer: (requestId, reason) => request(`/registrar/reject-transfer/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),
  },

  // Dashboards & Metrics
  stats: {
    getCitizenStats: () => request('/stats/citizen'),
    getRegistrarStats: () => request('/stats/registrar'),
  },

  // Activity & Explorer
  activity: {
    getLogs: () => request('/activity/logs'),
    getBlockchainTransactions: () => request('/activity/blockchain/transactions'),
    getBlockchainStatus: () => request('/activity/blockchain/status'),
  }
};

