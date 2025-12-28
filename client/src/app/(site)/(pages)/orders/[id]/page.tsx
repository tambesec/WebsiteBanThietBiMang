"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { ordersApi, axiosInstance } from "@/lib/api-client";
import Link from "next/link";

const OrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        const response = await ordersApi.ordersControllerFindOne(parseInt(orderId));
        const orderData = response.data?.data || response.data;
        setOrder(orderData);
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  // Handler for retry payment
  const handleRetryPayment = async () => {
    if (!orderId) return;
    
    try {
      setIsRetrying(true);
      const response = await axiosInstance.post(`/orders/${orderId}/retry-payment`);
      const data = response.data?.data || response.data;
      
      if (data.paymentUrl) {
        // Redirect to MoMo payment
        window.location.href = data.paymentUrl;
      } else {
        alert('Không thể tạo thanh toán. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error('Retry payment error:', err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi thanh toán lại');
    } finally {
      setIsRetrying(false);
    }
  };

  // Check if retry payment is available
  const canRetryPayment = () => {
    if (!order) return false;
    
    const paymentStatus = order.payment?.status || order.payment_status;
    const paymentMethod = order.payment?.method || order.payment_method;
    const orderStatus = order.status?.id || 1;
    
    console.log('Retry payment check:', { paymentMethod, paymentStatus, orderStatus });
    
    return (
      paymentMethod === 'momo' &&
      (paymentStatus === 'unpaid' || paymentStatus === 'failed') &&
      orderStatus <= 2 // Pending or Confirmed
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-[1170px] mx-auto px-4 py-20">
        <div className="bg-red-light-6 border border-red rounded-lg p-6 text-center">
          <p className="text-red font-medium mb-4">{error || 'Không tìm thấy đơn hàng'}</p>
          <Link href="/my-account" className="text-blue hover:underline">
            Quay lại trang đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const statusMap: any = {
      'pending': 'bg-yellow-light-4 text-yellow',
      'confirmed': 'bg-blue-light text-blue',
      'processing': 'bg-blue-light text-blue',
      'shipped': 'bg-purple-light text-purple',
      'delivered': 'bg-green-light-6 text-green',
      'cancelled': 'bg-red-light-6 text-red',
      'returned': 'bg-gray-3 text-dark',
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-3 text-dark';
  };

  return (
    <>
      <Breadcrumb title="Chi Tiết Đơn Hàng" pages={["Tài Khoản", "Đơn Hàng", order.order_number]} />
      
      <section className="overflow-hidden py-20 bg-gray-1">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Header */}
          <div className="bg-white shadow-1 rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-dark mb-2">
                  Đơn hàng #{order.order_number}
                </h1>
                <p className="text-gray-6">
                  Đặt ngày: {new Date(order.created_at).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status?.name)}`}>
                  {order.status?.name || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white shadow-1 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-dark mb-4">Sản phẩm</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-3">
                    <th className="text-left py-3 px-2 text-sm font-medium text-dark">Sản phẩm</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-dark">Giá</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-dark">Số lượng</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-dark">Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item: any, index: number) => (
                    <tr key={index} className="border-b border-gray-3">
                      <td className="py-4 px-2">
                        <p className="font-medium text-dark">{item.product_name}</p>
                        {item.product_sku && (
                          <p className="text-sm text-gray-6">SKU: {item.product_sku}</p>
                        )}
                      </td>
                      <td className="text-center py-4 px-2">
                        {(item.unit_price || 0).toLocaleString('vi-VN')}đ
                      </td>
                      <td className="text-center py-4 px-2">{item.quantity}</td>
                      <td className="text-right py-4 px-2 font-medium">
                        {(item.subtotal || (item.unit_price || 0) * item.quantity).toLocaleString('vi-VN')}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order Summary */}
            <div className="mt-6 flex justify-end">
              <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-6">Tạm tính:</span>
                  <span className="font-medium">{(order.amounts?.subtotal || order.subtotal || 0).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-6">Phí vận chuyển:</span>
                  <span className="font-medium">{(order.amounts?.shipping_fee || order.shipping_fee || 0).toLocaleString('vi-VN')}đ</span>
                </div>
                {(order.amounts?.tax_amount || order.tax_amount || 0) > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-6">Thuế VAT:</span>
                    <span className="font-medium">{(order.amounts?.tax_amount || order.tax_amount || 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                {(order.amounts?.discount_amount || order.discount_amount || 0) > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-6">Giảm giá:</span>
                    <span className="font-medium text-red">-{(order.amounts?.discount_amount || order.discount_amount || 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-t border-gray-3">
                  <span className="text-lg font-bold text-dark">Tổng cộng:</span>
                  <span className="text-lg font-bold text-blue">{(order.amounts?.total_amount || order.total_amount || 0).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="bg-white shadow-1 rounded-lg p-6">
              <h3 className="text-lg font-bold text-dark mb-4">Thông tin khách hàng</h3>
              <div className="space-y-2">
                <p className="text-dark"><span className="font-medium">Tên:</span> {order.customer?.name || order.customer_name}</p>
                <p className="text-dark"><span className="font-medium">Email:</span> {order.customer?.email || order.customer_email}</p>
                <p className="text-dark"><span className="font-medium">Số điện thoại:</span> {order.customer?.phone || order.customer_phone}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white shadow-1 rounded-lg p-6">
              <h3 className="text-lg font-bold text-dark mb-4">Địa chỉ giao hàng</h3>
              <div className="space-y-2">
                <p className="text-dark">
                  <span className="font-medium">Người nhận:</span>{' '}
                  {order.shipping_address?.recipient || order.shipping_recipient}
                </p>
                <p className="text-dark">
                  <span className="font-medium">Số điện thoại:</span>{' '}
                  {order.shipping_address?.phone || order.shipping_phone}
                </p>
                <p className="text-dark">
                  {order.shipping_address?.full_address || 
                   `${order.shipping_address?.address || order.shipping_address}${
                     order.shipping_address?.ward ? `, ${order.shipping_address.ward}` : ''
                   }${
                     order.shipping_address?.district ? `, ${order.shipping_address.district}` : ''
                   }${
                     order.shipping_address?.city ? `, ${order.shipping_address.city}` : ''
                   }`}
                </p>
              </div>
            </div>

            {/* Payment & Shipping Method */}
            <div className="bg-white shadow-1 rounded-lg p-6">
              <h3 className="text-lg font-bold text-dark mb-4">Phương thức thanh toán</h3>
              <div className="space-y-2">
                <p className="text-dark">
                  <span className="font-medium">Hình thức:</span>{' '}
                  {(order.payment?.method || order.payment_method) === 'cod' ? 'Thanh toán khi nhận hàng (COD)' :
                   (order.payment?.method || order.payment_method) === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
                   (order.payment?.method || order.payment_method) === 'momo' ? 'Ví MoMo' :
                   (order.payment?.method || order.payment_method) === 'zalopay' ? 'ZaloPay' :
                   (order.payment?.method || order.payment_method) === 'vnpay' ? 'VNPAY' : (order.payment?.method || order.payment_method)}
                </p>
                <p className="text-dark">
                  <span className="font-medium">Trạng thái:</span>{' '}
                  <span className={(order.payment?.status || order.payment_status) === 'paid' ? 'text-green' : 'text-yellow'}>
                    {(order.payment?.status || order.payment_status) === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </p>
                
                {/* Retry Payment Button */}
                {canRetryPayment() && (
                  <div className="mt-4 pt-4 border-t border-gray-3">
                    <button
                      onClick={handleRetryPayment}
                      disabled={isRetrying}
                      className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isRetrying ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          Thanh toán lại qua MoMo
                        </>
                      )}
                    </button>
                    <p className="text-sm text-gray-6 mt-2 text-center">
                      Nhấn để tạo mã thanh toán MoMo mới
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white shadow-1 rounded-lg p-6">
              <h3 className="text-lg font-bold text-dark mb-4">Phương thức vận chuyển</h3>
              <p className="text-dark">
                {(order.shipping?.method || order.shipping_method) === 'standard' ? 'Giao hàng tiêu chuẩn (3-5 ngày)' :
                 (order.shipping?.method || order.shipping_method) === 'express' ? 'Giao hàng nhanh (1-2 ngày)' :
                 (order.shipping?.method || order.shipping_method) === 'same_day' ? 'Giao hàng trong ngày' : (order.shipping?.method || order.shipping_method)}
              </p>
            </div>
          </div>

          {/* Customer Note */}
          {(order.notes?.customer_note || order.customer_note) && (
            <div className="bg-white shadow-1 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-bold text-dark mb-4">Ghi chú</h3>
              <p className="text-dark">{order.notes?.customer_note || order.customer_note}</p>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link 
              href="/my-account"
              className="inline-block bg-blue text-white px-8 py-3 rounded-md hover:bg-blue-dark transition-colors"
            >
              Quay lại đơn hàng của tôi
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default OrderDetailPage;
