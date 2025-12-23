import React from "react";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useCart } from "@/contexts/CartContext";

const ShippingMethod = () => {
  const { formData, updateFormData } = useCheckout();
  const { cart } = useCart();

  // Calculate shipping fee based on method and cart total
  const calculateShippingFee = (method: string): number => {
    const subtotal = cart?.summary?.subtotal || 0;
    
    // Free shipping for orders over 500,000 VND
    if (subtotal >= 500000) {
      return 0;
    }

    switch (method) {
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

  const currentShippingFee = calculateShippingFee(formData.shippingMethod);
  const subtotal = cart?.summary?.subtotal || 0;
  const isFreeShipping = subtotal >= 500000;

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Phương thức giao hàng</h3>
        {isFreeShipping && (
          <p className="text-sm text-green-600 mt-1">
            🎉 Miễn phí vận chuyển cho đơn hàng từ 500.000đ
          </p>
        )}
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-4">
          <label
            htmlFor="standard"
            className="flex cursor-pointer select-none items-center gap-3.5"
          >
            <div className="relative">
              <input
                type="radio"
                name="shippingMethod"
                id="standard"
                value="standard"
                checked={formData.shippingMethod === 'standard'}
                onChange={(e) => updateFormData({ shippingMethod: e.target.value as any })}
                className="sr-only"
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  formData.shippingMethod === 'standard'
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>
            <div>
              <p className="font-medium text-dark">Giao hàng tiêu chuẩn</p>
              <p className="text-sm text-gray-6">
                3-5 ngày làm việc - {isFreeShipping ? 'Miễn phí' : '30.000đ'}
              </p>
            </div>
          </label>

          <label
            htmlFor="express"
            className="flex cursor-pointer select-none items-center gap-3.5"
          >
            <div className="relative">
              <input
                type="radio"
                name="shippingMethod"
                id="express"
                value="express"
                checked={formData.shippingMethod === 'express'}
                onChange={(e) => updateFormData({ shippingMethod: e.target.value as any })}
                className="sr-only"
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  formData.shippingMethod === 'express'
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>
            <div>
              <p className="font-medium text-dark">Giao hàng nhanh</p>
              <p className="text-sm text-gray-6">
                1-2 ngày làm việc - {isFreeShipping ? 'Miễn phí' : '50.000đ'}
              </p>
            </div>
          </label>

          <label
            htmlFor="same_day"
            className="flex cursor-pointer select-none items-center gap-3.5"
          >
            <div className="relative">
              <input
                type="radio"
                name="shippingMethod"
                id="same_day"
                value="same_day"
                checked={formData.shippingMethod === 'same_day'}
                onChange={(e) => updateFormData({ shippingMethod: e.target.value as any })}
                className="sr-only"
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  formData.shippingMethod === 'same_day'
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>
            <div>
              <p className="font-medium text-dark">Giao hàng trong ngày</p>
              <p className="text-sm text-gray-6">
                Trong ngày (nội thành) - {isFreeShipping ? 'Miễn phí' : '80.000đ'}
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ShippingMethod;
