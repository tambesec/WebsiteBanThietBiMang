import { Metadata } from "next";
import ContactsTable from "@/components/ecommerce/ContactsTable";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export const metadata: Metadata = {
  title: "Quản Lý Liên Hệ | NetTechPro Admin",
  description: "Quản lý các yêu cầu liên hệ từ khách hàng",
};

export default function ContactsPage() {
  return (
    <>
      <PageBreadCrumb pageTitle="Quản Lý Liên Hệ" />
      
      <div className="flex flex-col gap-6">
        <ContactsTable />
      </div>
    </>
  );
}
