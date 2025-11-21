/**
 * Addresses API Service
 */

import { apiClient } from './client';
import { unwrapResponse } from './utils';

export interface Address {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressDto {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault?: boolean;
}

export const addressesApi = {
  /**
   * Lấy tất cả địa chỉ của user
   */
  getAll: async (): Promise<Address[]> => {
    const response = await apiClient.get('/api/v1/users/addresses');
    return unwrapResponse<Address[]>(response);
  },

  /**
   * Lấy địa chỉ theo ID
   */
  getById: async (id: number): Promise<Address> => {
    const response = await apiClient.get(`/api/v1/users/addresses/${id}`);
    return unwrapResponse<Address>(response);
  },

  /**
   * Tạo địa chỉ mới
   */
  create: async (addressData: CreateAddressDto): Promise<Address> => {
    const response = await apiClient.post('/api/v1/users/addresses', addressData);
    return unwrapResponse<Address>(response);
  },

  /**
   * Cập nhật địa chỉ
   */
  update: async (id: number, addressData: CreateAddressDto): Promise<Address> => {
    const response = await apiClient.put(`/api/v1/users/addresses/${id}`, addressData);
    return unwrapResponse<Address>(response);
  },

  /**
   * Xóa địa chỉ
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/users/addresses/${id}`);
  },
};

export default addressesApi;
