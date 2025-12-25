/**
 * Admin Dashboard API Service
 */

import { apiClient } from './client';
import { unwrapResponse } from './utils';
import { DashboardStats, RevenueChartData, OrdersChartData } from './types';

export const adminDashboardApi = {
  /**
   * Lấy thống kê tổng quan
   */
  getStats: async (params?: { 
    startDate?: string; 
    endDate?: string;
  }): Promise<DashboardStats> => {
    const response = await apiClient.get('/api/v1/admin/stats', { 
      params 
    });
    return unwrapResponse<DashboardStats>(response);
  },

  /**
   * Lấy dữ liệu biểu đồ doanh thu
   */
  getRevenueChart: async (params?: { 
    startDate?: string; 
    endDate?: string;
    period?: 'day' | 'week' | 'month';
  }): Promise<RevenueChartData[]> => {
    const response = await apiClient.get('/api/v1/admin/revenue', { 
      params 
    });
    return unwrapResponse<RevenueChartData[]>(response);
  },

  /**
   * Lấy dữ liệu biểu đồ đơn hàng theo trạng thái
   */
  getOrdersChart: async (params?: { 
    startDate?: string; 
    endDate?: string;
  }): Promise<OrdersChartData[]> => {
    const response = await apiClient.get('/api/v1/admin/orders', { 
      params 
    });
    return unwrapResponse<OrdersChartData[]>(response);
  },

  /**
   * Lấy danh sách users mới
   */
  getRecentUsers: async (limit: number = 10): Promise<any[]> => {
    const response = await apiClient.get('/api/v1/admin/users', { params: { limit } });
    return unwrapResponse<any[]>(response);
  },
};

export default adminDashboardApi;
