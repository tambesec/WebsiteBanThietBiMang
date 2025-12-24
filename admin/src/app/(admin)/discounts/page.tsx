import DiscountsTable from "@/components/discounts/DiscountsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản Lý Mã Giảm Giá | Network Store Admin",
  description: "Quản lý mã giảm giá của Network Store",
};

export default function DiscountsPage() {
  return (
    <div>
      <DiscountsTable />
    </div>
  );
}
