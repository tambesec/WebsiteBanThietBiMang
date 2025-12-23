import RecentView from "@/components/RecentView";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sản Phẩm Đã Xem - NetTechPro",
  description: "Xem lại các sản phẩm bạn đã xem gần đây tại NetTechPro",
};

const RecentViewPage = () => {
  return (
    <main>
      <RecentView />
    </main>
  );
};

export default RecentViewPage;
