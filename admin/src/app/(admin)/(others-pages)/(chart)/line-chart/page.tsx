import LineChartOne from "@/components/charts/line/LineChartOne";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Biểu Đồ Đường | NetTechPro Admin",
  description:
    "Trang Biểu Đồ Đường cho NetTechPro - Bảng Điều Khiển Quản Trị",
};
export default function LineChart() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Biểu Đồ Đường" />
      <div className="space-y-6">
        <ComponentCard title="Line Chart 1">
          <LineChartOne />
        </ComponentCard>
      </div>
    </div>
  );
}
