"use client";
import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { adminDashboardApi } from "@/services/api";

export const EcommerceMetrics = () => {
  const [stats, setStats] = useState({
    totalUsers: 3782,
    usersGrowth: 11.01,
    totalOrders: 5359,
    ordersGrowth: -9.05,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminDashboardApi.getStats('month');
        setStats({
          totalUsers: data.totalUsers,
          usersGrowth: data.usersGrowth,
          totalOrders: data.totalOrders,
          ordersGrowth: data.ordersGrowth,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="h-12 w-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
          <div className="mt-5 space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div className="h-6 w-24 bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
        </div>
        <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="h-12 w-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
          <div className="mt-5 space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div className="h-6 w-24 bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Khách Hàng
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {stats.totalUsers.toLocaleString()}
            </h4>
          </div>
          <Badge color={stats.usersGrowth >= 0 ? "success" : "error"}>
            {stats.usersGrowth >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(stats.usersGrowth).toFixed(2)}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Đơn Hàng
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {stats.totalOrders.toLocaleString()}
            </h4>
          </div>

          <Badge color={stats.ordersGrowth >= 0 ? "success" : "error"}>
            {stats.ordersGrowth >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon className="text-error-500" />}
            {Math.abs(stats.ordersGrowth).toFixed(2)}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
