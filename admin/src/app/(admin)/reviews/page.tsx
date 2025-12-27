import ReviewsTable from "@/components/reviews/ReviewsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản Lý Đánh Giá | Network Store Admin",
  description: "Quản lý đánh giá sản phẩm của Network Store",
};

export default function ReviewsPage() {
  return (
    <div>
      <ReviewsTable />
    </div>
  );
}
