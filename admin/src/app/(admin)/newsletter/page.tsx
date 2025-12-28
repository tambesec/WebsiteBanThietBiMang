import React from "react";
import NewsletterTable from "@/components/ecommerce/NewsletterTable";

export const metadata = {
  title: "Quản Lý Newsletter",
  description: "Quản lý danh sách đăng ký nhận tin",
};

const NewsletterPage = () => {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dark dark:text-white">
          Quản Lý Newsletter
        </h1>
        <p className="mt-2 text-body-color dark:text-dark-6">
          Danh sách người đăng ký nhận tin
        </p>
      </div>
      <NewsletterTable />
    </div>
  );
};

export default NewsletterPage;
