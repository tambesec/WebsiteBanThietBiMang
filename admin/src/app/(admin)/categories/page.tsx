"use client";

import { useState } from "react";
import CategoriesTable from "@/components/categories/CategoriesTable";
import CategoryReorder from "@/components/categories/CategoryReorder";
import CategoryTree from "@/components/categories/CategoryTree";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

type TabView = "table" | "reorder" | "tree";

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<TabView>("table");

  return (
    <>
      <PageBreadCrumb pageTitle="Quản Lý Danh Mục" />
      
      <div className="flex flex-col gap-6">
        {/* Tabs Navigation */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke dark:border-strokedark">
            <div className="flex gap-4 px-6 py-4">
              <button
                onClick={() => setActiveTab("table")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "table"
                    ? "border-b-2 border-primary text-primary"
                    : "text-body hover:text-primary"
                }`}
              >
                Bảng Danh Mục
              </button>
              
              <button
                onClick={() => setActiveTab("reorder")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "reorder"
                    ? "border-b-2 border-primary text-primary"
                    : "text-body hover:text-primary"
                }`}
              >
                Sắp Xếp Thứ Tự
              </button>
              
              <button
                onClick={() => setActiveTab("tree")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "tree"
                    ? "border-b-2 border-primary text-primary"
                    : "text-body hover:text-primary"
                }`}
              >
                Cây Phân Cấp
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "table" && <CategoriesTable />}
        {activeTab === "reorder" && <CategoryReorder />}
        {activeTab === "tree" && <CategoryTree />}
      </div>
    </>
  );
}
