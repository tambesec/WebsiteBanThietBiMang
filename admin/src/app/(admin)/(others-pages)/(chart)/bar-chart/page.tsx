import BarChartOne from "@/components/charts/bar/BarChartOne";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Biểu Đồ Cột | NetTechPro Admin",
  description:
    "Trang Biểu Đồ Cột cho NetTechPro - Bảng Điều Khiển Quản Trị",
};

export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Biểu Đồ Cột" />
      <div className="space-y-6">
        <ComponentCard title="Bar Chart 1">
          <BarChartOne />
        </ComponentCard>
      </div>
    </div>
  );
}
