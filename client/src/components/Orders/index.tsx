import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";
import ordersData from "./ordersData";
import { ordersApi } from "@/lib/api-client";
import type { OrderDto } from "@/generated-api";

const Orders = () => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await ordersApi.ordersControllerFindAll(
          'all', // status
          undefined, // search
          'created_at', // sort_by
          'desc', // sort_order
          1, // page
          100 // limit
        );
        // Backend: { data: { orders: [...], pagination: {...} } }
        const result = response.data?.data || response.data;
        const items = result?.orders || [];
        
        // Transform data to match SingleOrder component interface
        const transformedOrders = items.map((order: any) => ({
          orderId: order.order_number || order.id,
          createdAt: new Date(order.created_at).toLocaleDateString('vi-VN', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          }),
          status: order.status?.name?.toLowerCase() || 'pending',
          total: `${order.total_amount?.toLocaleString('vi-VN')}₫`,
          title: order.items?.map((item: any) => item.product_name || item.product?.name).join(', ') || 'Đơn hàng',
          rawOrder: order // Keep original data for details
        }));
        
        setOrders(transformedOrders as any);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Không thể tải danh sách đơn hàng');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue"></div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[770px]">
          {/* <!-- order item --> */}
          {orders.length > 0 && (
            <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex ">
              <div className="min-w-[111px]">
                <p className="text-custom-sm text-dark">Order</p>
              </div>
              <div className="min-w-[175px]">
                <p className="text-custom-sm text-dark">Date</p>
              </div>

              <div className="min-w-[128px]">
                <p className="text-custom-sm text-dark">Status</p>
              </div>

              <div className="min-w-[213px]">
                <p className="text-custom-sm text-dark">Title</p>
              </div>

              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Total</p>
              </div>

              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Action</p>
              </div>
            </div>
          )}
          {orders.length > 0 ? (
            orders.map((orderItem, key) => (
              <SingleOrder key={key} orderItem={orderItem} smallView={false} />
            ))
          ) : (
            <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">
              Bạn chưa có đơn hàng nào!
            </p>
          )}
        </div>

        {orders.length > 0 &&
          orders.map((orderItem, key) => (
            <SingleOrder key={key} orderItem={orderItem} smallView={true} />
          ))}
      </div>
    </>
  );
};

export default Orders;
