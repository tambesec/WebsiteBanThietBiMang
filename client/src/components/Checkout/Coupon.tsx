import React, { useState } from "react";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useCart } from "@/contexts/CartContext";
import { discountsApi } from "@/lib/api-client";

interface DiscountInfo {
  discountAmount: number;
  finalAmount: number;
  discountType: string;
  discountValue: number;
}

const Coupon = () => {
  const { formData, updateFormData } = useCheckout();
  const { cart } = useCart();
  const [localCode, setLocalCode] = useState('');
  const [message, setMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(null);

  const handleApplyCoupon = async () => {
    if (!localCode.trim()) {
      setMessage('Vui lòng nhập mã giảm giá');
      return;
    }

    setIsValidating(true);
    setMessage('');
    setDiscountInfo(null);

    try {
      const orderAmount = cart?.summary?.subtotal || 0;
      const response = await discountsApi.discountsControllerValidate({
        code: localCode.trim().toUpperCase(),
        order_amount: orderAmount,
      });
      
      const data = (response.data as any)?.data || response.data;
      
      if (data?.valid && data?.discount) {
        updateFormData({ discountCode: localCode.trim().toUpperCase() });
        setDiscountInfo({
          discountAmount: data.discount.discount_amount,
          finalAmount: data.discount.final_amount,
          discountType: data.discount.discount_type,
          discountValue: data.discount.discount_value,
        });
        setMessage(`Áp dụng thành công! Giảm ${formatCurrency(data.discount.discount_amount)}`);
      } else {
        setMessage(data?.message || 'Mã giảm giá không hợp lệ');
        updateFormData({ discountCode: undefined });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Không thể áp dụng mã giảm giá';
      setMessage(errorMessage);
      updateFormData({ discountCode: undefined });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setLocalCode('');
    setMessage('');
    setDiscountInfo(null);
    updateFormData({ discountCode: undefined });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Bạn có mã giảm giá không?</h3>
      </div>

      <div className="py-8 px-4 sm:px-8.5">
        <div className="flex gap-4">
          <input
            type="text"
            name="coupon"
            id="coupon"
            value={localCode}
            onChange={(e) => setLocalCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã giảm giá"
            disabled={isValidating || !!discountInfo}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50 uppercase"
          />

          {discountInfo ? (
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="inline-flex font-small text-white bg-red-500 py-3 px-6 rounded-md ease-out duration-200 hover:bg-red-600 whitespace-nowrap"
            >
              Hủy
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={isValidating}
              className="inline-flex font-small text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark whitespace-nowrap disabled:opacity-50"
            >
              {isValidating ? 'Đang kiểm tra...' : 'Áp dụng'}
            </button>
          )}
        </div>
        
        {message && (
          <p className={`mt-2 text-sm ${discountInfo ? 'text-green-600' : 'text-red'}`}>
            {message}
          </p>
        )}
        
        {discountInfo && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">
              Mã: {formData.discountCode}
            </p>
            <p className="text-green-600 text-sm mt-1">
              {discountInfo.discountType === 'percentage' 
                ? `Giảm ${discountInfo.discountValue}%` 
                : `Giảm ${formatCurrency(discountInfo.discountValue)}`}
            </p>
            <p className="text-green-700 font-bold mt-1">
              Số tiền giảm: -{formatCurrency(discountInfo.discountAmount)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupon;
