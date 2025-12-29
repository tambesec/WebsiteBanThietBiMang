"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";
import { CheckoutProvider, useCheckout } from "@/contexts/CheckoutContext";
import { useCart } from "@/contexts/CartContext";

function CheckoutContent() {
  const router = useRouter();
  const { formData, updateFormData, submitOrder, isSubmitting } = useCheckout();
  const { cart } = useCart();
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Calculate shipping fee based on selected method and cart total
  const calculateShippingFee = (): number => {
    const subtotal = cart?.summary?.subtotal || 0;
    
    // Free shipping for orders over 500,000 VND
    if (subtotal >= 500000) {
      return 0;
    }

    switch (formData.shippingMethod) {
      case 'standard':
        return 30000;
      case 'express':
        return 50000;
      case 'same_day':
        return 80000;
      default:
        return 30000;
    }
  };

  const shippingFee = calculateShippingFee();
  const subtotal = cart?.summary?.subtotal || 0;
  const tax = cart?.summary?.tax || 0;
  const discount = cart?.summary?.discount_amount || 0;
  const total = subtotal + shippingFee + tax - discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if cart is empty
    if (!cart || !cart.items || cart.items.length === 0) {
      alert('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi đặt hàng.');
      router.push('/shop');
      return;
    }
    
    try {
      const order = await submitOrder();
      
      // If MoMo payment, redirect to MoMo payment page
      if (order.paymentUrl) {
        // Redirect to MoMo payment page
        window.location.href = order.paymentUrl;
        return;
      }
      
      // For other payment methods (COD, bank transfer)
      setOrderSuccess(true);
      alert(`Đặt hàng thành công! Mã đơn hàng: ${order.order_number}`);
      router.push(`/orders/${order.id}`);
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi đặt hàng');
    }
  };

  return (
    <>
      <Breadcrumb title={"Thanh Toán"} pages={["Thanh Toán"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                {/* <!-- login box --> */}
                <Login />

                {/* <!-- billing details --> */}
                <Billing />

                {/* <!-- address box two --> */}
                <Shipping />
              </div>

              {/* // <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                {/* <!-- order list box --> */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Giỏ hàng của bạn
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* <!-- title --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">Sản phẩm</h4>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark text-right">
                          Tổng phụ
                        </h4>
                      </div>
                    </div>

                    {/* <!-- product items from cart --> */}
                    {cart?.items && cart.items.length > 0 ? (
                      cart.items.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between py-5 border-b border-gray-3">
                          <div>
                            <p className="text-dark">
                              {item.product?.name || 'Sản phẩm'} × {item.quantity}
                            </p>
                          </div>
                          <div>
                            <p className="text-dark text-right">
                              {((item.price || 0) * item.quantity).toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-5 text-center text-gray-500">
                        Giỏ hàng trống
                      </div>
                    )}

                    {/* <!-- shipping fee --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <p className="text-dark">Phí vận chuyển</p>
                        {subtotal >= 500000 && (
                          <p className="text-xs text-green-600">Miễn phí cho đơn ≥500K</p>
                        )}
                      </div>
                      <div>
                        <p className="text-dark text-right">
                          {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}đ`}
                        </p>
                      </div>
                    </div>

                    {/* <!-- tax --> */}
                    {tax > 0 && (
                      <div className="flex items-center justify-between py-5 border-b border-gray-3">
                        <div>
                          <p className="text-dark">Thuế VAT (10%)</p>
                        </div>
                        <div>
                          <p className="text-dark text-right">
                            {tax.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    )}

                    {/* <!-- discount --> */}
                    {discount > 0 && (
                      <div className="flex items-center justify-between py-5 border-b border-gray-3">
                        <div>
                          <p className="text-dark">Giảm giá</p>
                        </div>
                        <div>
                          <p className="text-red text-right">
                            -{discount.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    )}

                    {/* <!-- total --> */}
                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <p className="font-medium text-lg text-dark">Tổng</p>
                      </div>
                      <div>
                        <p className="font-medium text-lg text-dark text-right">
                          {total.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <!-- coupon box --> */}
                <Coupon />

                {/* <!-- shipping box --> */}
                <ShippingMethod />

                {/* <!-- payment box --> */}
                <PaymentMethod />

                {/* <!-- customer note --> */}
                <div className="bg-white shadow-1 rounded-[10px] mt-7.5 p-4 sm:p-8.5">
                  <label htmlFor="customerNote" className="block mb-2.5">
                    Ghi chú đơn hàng (không bắt buộc)
                  </label>
                  <textarea
                    id="customerNote"
                    name="customerNote"
                    value={formData.customerNote || ''}
                    onChange={(e) => updateFormData({ customerNote: e.target.value })}
                    placeholder="Nhập ghi chú cho đơn hàng của bạn..."
                    rows={4}
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 resize-none"
                  />
                </div>

                {/* <!-- checkout button --> */}
                <button
                  type="submit"
                  disabled={isSubmitting || !cart || !cart.items || cart.items.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:bg-gray-4 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

const Checkout = () => {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  );
};

export default Checkout;
