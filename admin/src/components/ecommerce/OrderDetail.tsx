"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ordersApi } from "@/lib/api-client";
import Badge from "../ui/badge/Badge";

interface OrderDetailProps {
  orderId: string;
}

const OrderDetail = ({ orderId }: OrderDetailProps) => {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const statusOptions = [
    { value: "pending", label: "Chờ xử lý", color: "warning", id: 1 },
    { value: "confirmed", label: "Đã xác nhận", color: "info", id: 2 },
    { value: "processing", label: "Đang xử lý", color: "warning", id: 3 },
    { value: "shipped", label: "Đang vận chuyển", color: "info", id: 4 },
    { value: "delivered", label: "Đã giao", color: "success", id: 5 },
    { value: "cancelled", label: "Đã hủy", color: "error", id: 6 },
    { value: "returned", label: "Đã trả hàng", color: "error", id: 7 },
  ];

  const getStatusId = (statusValue: string): number => {
    const status = statusOptions.find(s => s.value === statusValue.toLowerCase());
    return status?.id || 1;
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.ordersControllerFindOne(Number(orderId));
      const orderData = response.data.data || response.data;
      console.log('Order data:', orderData); // Debug log
      setOrder(orderData);
      setSelectedStatus(orderData?.status?.name?.toLowerCase() || "pending");
      setTrackingNumber(orderData?.tracking_number || "");
      setPaymentStatus(orderData?.payment?.status || orderData?.payment_status || "");
      setAdminNote(orderData?.admin_note || "");
    } catch (error: any) {
      console.error('Failed to fetch order:', error);
      alert(error.response?.data?.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;
    
    try {
      setUpdating(true);
      const statusId = getStatusId(selectedStatus);
      const updateData: any = {
        status_id: statusId,
        note: statusNote || undefined,
      };
      
      // Add optional fields if changed
      if (trackingNumber !== (order?.tracking_number || "")) {
        updateData.tracking_number = trackingNumber || undefined;
      }
      if (paymentStatus !== (order?.payment?.status || order?.payment_status || "")) {
        updateData.payment_status = paymentStatus || undefined;
      }
      if (adminNote !== (order?.admin_note || "")) {
        updateData.admin_note = adminNote || undefined;
      }
      
      await ordersApi.ordersControllerUpdateStatus(Number(orderId), updateData);
      alert('Cập nhật thành công!');
      setStatusNote(''); // Clear note after success
      fetchOrderDetail(); // Refresh
    } catch (error: any) {
      console.error('Failed to update status:', error);
      alert(error.response?.data?.message || 'Không thể cập nhật đơn hàng');
    } finally {
      setUpdating(false);
    }
  };

  // Check if any field has changed
  const hasChanges = () => {
    if (!order) return false;
    
    const statusChanged = selectedStatus !== order.status?.name?.toLowerCase();
    const trackingChanged = trackingNumber !== (order.tracking_number || "");
    const paymentChanged = paymentStatus !== (order.payment?.status || order.payment_status || "");
    const adminNoteChanged = adminNote !== (order.admin_note || "");
    
    return statusChanged || trackingChanged || paymentChanged || adminNoteChanged;
  };

  const formatPrice = (price?: number) => {
    if (!price) return '0đ';
    return new Intl.NumberFormat("vi-VN").format(price) + 'đ';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const config = statusOptions.find(s => s.value === status?.toLowerCase());
    return config?.color || "warning";
  };

  const getPaymentStatusColor = (status?: string): "success" | "warning" | "error" | "info" => {
    const statusMap: Record<string, "success" | "warning" | "error" | "info"> = {
      'paid': 'success',
      'unpaid': 'error',
      'pending': 'warning',
      'refunded': 'info',
    };
    return statusMap[status?.toLowerCase() || 'unpaid'] || 'error';
  };

  const getPaymentStatusText = (status?: string) => {
    const statusTextMap: Record<string, string> = {
      'paid': 'Đã thanh toán',
      'unpaid': 'Chưa thanh toán',
      'pending': 'Chờ thanh toán',
      'refunded': 'Đã hoàn tiền',
    };
    return statusTextMap[status?.toLowerCase() || 'unpaid'] || status || 'N/A';
  };

  const getPaymentMethodLabel = (method?: string) => {
    const methodLabels: Record<string, string> = {
      cod: "Thanh toán khi nhận hàng (COD)",
      vnpay: "VNPay",
      momo: "MoMo",
      zalopay: "ZaloPay",
      bank_transfer: "Chuyển khoản ngân hàng",
    };
    return methodLabels[method?.toLowerCase() || 'cod'] || method || 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-10 shadow-default dark:border-strokedark dark:bg-boxdark">
        <p className="text-center text-danger">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Order Info Card */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-black dark:text-white">
              Đơn hàng #{order.order_number}
            </h3>
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              ← Quay lại danh sách
            </Link>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Customer Info */}
            <div>
              <h4 className="mb-3 font-medium text-black dark:text-white">
                Thông tin khách hàng
              </h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Họ tên:</span> {order.customer?.name || order.customer_name}</p>
                <p><span className="font-medium">Email:</span> {order.customer?.email || order.customer_email}</p>
                <p><span className="font-medium">Điện thoại:</span> {order.customer?.phone || order.customer_phone}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h4 className="mb-3 font-medium text-black dark:text-white">
                Địa chỉ giao hàng
              </h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Người nhận:</span> {order.shipping_address?.recipient}</p>
                <p><span className="font-medium">Điện thoại:</span> {order.shipping_address?.phone}</p>
                <p><span className="font-medium">Địa chỉ:</span> {order.shipping_address?.full_address || order.shipping_address?.address}</p>
              </div>
            </div>

            {/* Order Status */}
            <div>
              <h4 className="mb-3 font-medium text-black dark:text-white">
                Trạng thái đơn hàng
              </h4>
              <div className="mb-3">
                <Badge
                  size="md"
                  color={statusOptions.find(s => s.value === order.status?.name?.toLowerCase())?.color as any || 'warning'}
                >
                  {statusOptions.find(s => s.value === order.status?.name?.toLowerCase())?.label || order.status?.name}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Trạng thái đơn hàng
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Số vận đơn (Tracking Number)
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="VD: GHTK123456789"
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Trạng thái thanh toán
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                  >
                    <option value="">Chọn trạng thái...</option>
                    <option value="unpaid">Đang chờ thanh toán</option>
                    <option value="pending">Chờ xác nhận</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="refunded">Đã hoàn tiền</option>
                  </select>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Ghi chú nội bộ (Admin Notes)
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Ghi chú nội bộ, không hiển thị cho khách..."
                    rows={2}
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Ghi chú lịch sử (Hiển thị cho khách)
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Ghi chú khi cập nhật trạng thái (tùy chọn)..."
                    rows={2}
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                  />
                </div>
                
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating || !hasChanges()}
                  className="w-full rounded-lg bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-white">Đang cập nhật...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white">Cập nhật trạng thái</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <h4 className="mb-3 font-medium text-black dark:text-white">
                Thông tin thanh toán
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Phương thức: </span>
                  <span>{getPaymentMethodLabel(order.payment?.method || order.payment_method)}</span>
                </div>
                <div>
                  <span className="font-medium">Trạng thái thanh toán: </span>
                  <Badge
                    size="sm"
                    color={getPaymentStatusColor(order.payment?.status || order.payment_status)}
                  >
                    {getPaymentStatusText(order.payment?.status || order.payment_status)}
                  </Badge>
                </div>
                {(order.payment?.paid_at || order.paid_at) && (
                  <p><span className="font-medium">Thanh toán lúc:</span> {formatDate(order.payment?.paid_at || order.paid_at)}</p>
                )}
                <p><span className="font-medium">Ngày đặt:</span> {formatDate(order.created_at)}</p>
              </div>
            </div>

            {/* Shipping Info */}
            {(order.shipping?.tracking_number || order.tracking_number || order.shipping?.shipped_at || order.shipped_at) && (
              <div>
                <h4 className="mb-3 font-medium text-black dark:text-white">
                  Thông tin vận chuyển
                </h4>
                <div className="space-y-2 text-sm">
                  {(order.shipping?.method || order.shipping_method) && (
                    <p><span className="font-medium">Phương thức:</span> {order.shipping?.method || order.shipping_method}</p>
                  )}
                  {(order.shipping?.tracking_number || order.tracking_number) && (
                    <div>
                      <span className="font-medium">Mã vận đơn: </span>
                      <span className="font-mono text-primary">{order.shipping?.tracking_number || order.tracking_number}</span>
                    </div>
                  )}
                  {(order.shipping?.shipped_at || order.shipped_at) && (
                    <p><span className="font-medium">Ngày gửi hàng:</span> {formatDate(order.shipping?.shipped_at || order.shipped_at)}</p>
                  )}
                  {(order.shipping?.delivered_at || order.delivered_at) && (
                    <p><span className="font-medium">Ngày giao hàng:</span> {formatDate(order.shipping?.delivered_at || order.delivered_at)}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
          <h3 className="font-semibold text-black dark:text-white">
            Sản phẩm ({order.items?.length || 0})
          </h3>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke dark:border-strokedark">
                  <th className="pb-3 text-left font-medium">Sản phẩm</th>
                  <th className="pb-3 text-left font-medium">Đơn giá</th>
                  <th className="pb-3 text-left font-medium">Số lượng</th>
                  <th className="pb-3 text-right font-medium">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item: any) => (
                  <tr key={item.id} className="border-b border-stroke dark:border-strokedark">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {item.product_image && (
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                            <Image
                              src={item.product_image}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-black dark:text-white">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-gray-500">SKU: {item.product_sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">{formatPrice(item.unit_price)}</td>
                    <td className="py-4">×{item.quantity}</td>
                    <td className="py-4 text-right font-medium">
                      {formatPrice(item.subtotal || (item.unit_price * item.quantity))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Summary */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tạm tính:</span>
                <span>{formatPrice(order.amounts?.subtotal || order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Phí vận chuyển:</span>
                <span>{formatPrice(order.amounts?.shipping_fee || order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>VAT (10%):</span>
                <span>{formatPrice(order.amounts?.tax_amount || order.tax_amount)}</span>
              </div>
              {(order.amounts?.discount_amount || order.discount_amount) > 0 && (
                <div className="flex justify-between text-sm text-danger">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(order.amounts?.discount_amount || order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-stroke pt-2 text-lg font-bold dark:border-strokedark">
                <span>Tổng cộng:</span>
                <span className="text-primary">{formatPrice(order.amounts?.total_amount || order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order History */}
      {order.history && order.history.length > 0 && (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
            <h3 className="font-semibold text-black dark:text-white">
              Lịch sử đơn hàng
            </h3>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {order.history.map((entry: any, index: number) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <div className="flex-shrink-0 text-gray-500">
                    {formatDate(entry.created_at)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {typeof entry.status === 'object' ? entry.status?.name : entry.status}
                    </p>
                    {entry.note && <p className="text-gray-500">{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
