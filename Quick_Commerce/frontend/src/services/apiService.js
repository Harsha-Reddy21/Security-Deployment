import api from './api';

// Auth Services
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateUserProfile = async (userData) => {
  const response = await api.put('/auth/me', userData);
  return response.data;
};

export const updateUserPassword = async (passwordData) => {
  const response = await api.put('/auth/me/password', passwordData);
  return response.data;
};

// Medicine Services
export const getAllMedicines = async (page = 1, limit = 10, search = '') => {
  const response = await api.get(`/medicines?page=${page}&limit=${limit}&search=${search}`);
  return response.data;
};

export const getMedicineById = async (id) => {
  const response = await api.get(`/medicines/${id}`);
  return response.data;
};

// Cart Services
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (medicineId, quantity) => {
  const response = await api.post('/cart/add', { medicine_id: medicineId, quantity });
  return response.data;
};

export const updateCartItem = async (medicineId, quantity) => {
  const response = await api.put('/cart/update', { medicine_id: medicineId, quantity });
  return response.data;
};

export const removeFromCart = async (medicineId) => {
  const response = await api.delete(`/cart/remove/${medicineId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete('/cart/clear');
  return response.data;
};

// Order Services
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getUserOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// Prescription Services
export const uploadPrescription = async (formData) => {
  const response = await api.post('/prescriptions/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getUserPrescriptions = async () => {
  const response = await api.get('/prescriptions');
  return response.data;
};

export const getPrescriptionById = async (id) => {
  const response = await api.get(`/prescriptions/${id}`);
  return response.data;
};

// Address Services
export const addAddress = async (addressData) => {
  const response = await api.post('/address', addressData);
  return response.data;
};

export const getUserAddresses = async () => {
  const response = await api.get('/address');
  return response.data;
};

export const updateAddress = async (id, addressData) => {
  const response = await api.put(`/address/${id}`, addressData);
  return response.data;
};

export const deleteAddress = async (id) => {
  const response = await api.delete(`/address/${id}`);
  return response.data;
};

// Create a default export with all the API functions
const apiService = {
  login,
  register,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getAllMedicines,
  getMedicineById,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  createOrder,
  getUserOrders,
  getOrderById,
  uploadPrescription,
  getUserPrescriptions,
  getPrescriptionById,
  addAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress
};

export default apiService; 