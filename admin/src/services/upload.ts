/**
 * Admin Upload API Service
 */

import { apiClient } from './client';
import { unwrapResponse } from './utils';

export const adminUploadApi = {
  /**
   * Upload single image
   */
  uploadImage: async (file: File, folder?: string): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await apiClient.post('/api/v1/admin/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapResponse<string>(response);
  },

  /**
   * Upload multiple images
   */
  uploadImages: async (files: File[], folder?: string): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await apiClient.post('/api/v1/admin/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapResponse<string[]>(response);
  },

  /**
   * Delete image by URL
   */
  deleteImage: async (imageUrl: string): Promise<void> => {
    await apiClient.delete('/api/v1/admin/upload/image', { 
      data: { imageUrl } 
    });
  },
};

export default adminUploadApi;
