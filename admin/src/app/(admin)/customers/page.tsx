import CustomersTable from "@/components/customers/CustomersTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản Lý Khách Hàng | Network Store Admin",
  description: "Quản lý danh sách khách hàng của Network Store",
};

export default function CustomersPage() {
  return (
    <div>
      <CustomersTable />
    </div>
  );
}
