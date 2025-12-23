import React, { useState } from "react";
import { useCheckout } from "@/contexts/CheckoutContext";

const Coupon = () => {
  const { formData, updateFormData } = useCheckout();
  const [localCode, setLocalCode] = useState('');
  const [message, setMessage] = useState('');

  const handleApplyCoupon = () => {
    if (!localCode.trim()) {
      setMessage('Vui lòng nhập mã giảm giá');
      return;
    }
    
    updateFormData({ discountCode: localCode });
    setMessage(`Đã áp dụng mã: ${localCode}`);
    // TODO: Call backend API to validate coupon
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
            onChange={(e) => setLocalCode(e.target.value)}
            placeholder="Nhập mã giảm giá"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />

          <button
            type="button"
            onClick={handleApplyCoupon}
            className="inline-flex font-small text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark whitespace-nowrap"
          >
            Áp dụng
          </button>
        </div>
        {message && (
          <p className={`mt-2 text-sm ${message.includes('Đã áp dụng') ? 'text-green-600' : 'text-red'}`}>
            {message}
          </p>
        )}
        {formData.discountCode && (
          <p className="mt-2 text-sm text-dark">
            Mã đang áp dụng: <span className="font-medium">{formData.discountCode}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Coupon;
