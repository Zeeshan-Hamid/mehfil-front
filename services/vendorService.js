import apiService from '../app/utils/api';

export const getVendorProfile = async (vendorId) => {
  try {
    const response = await apiService.request(`/public-vendor/${vendorId}`);
    return response;
  } catch (error) {
    throw error;
  }
};
