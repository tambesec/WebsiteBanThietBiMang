import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import VideosExample from "@/components/ui/video/VideosExample";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Video | NetTechPro Admin",
  description:
    "Trang Video cho NetTechPro - Bảng Điều Khiển Quản Trị",
};

export default function VideoPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Video" />

      <VideosExample />
    </div>
  );
}
