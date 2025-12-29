import React, { useState } from "react";
import { discountsApi } from "@/lib/api-client";

const Discount = () => {
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!couponCode.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập mã giảm giá' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await discountsApi.discountsControllerValidate({
        code: couponCode,
      });

      const result = response.data?.data || response.data;
      
      if (result.valid) {
        setMessage({ 
          type: 'success', 
          text: `Áp dụng thành công! Giảm ${result.discount?.type === 'percentage' ? result.discount.value + '%' : result.discount?.value?.toLocaleString('vi-VN') + 'đ'}` 
        });
        // TODO: Apply discount to cart
      } else {
        setMessage({ type: 'error', text: result.message || 'Mã giảm giá không hợp lệ' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lg:max-w-[670px] w-full">
      <form onSubmit={handleApplyCoupon}>
        {/* <!-- coupon box --> */}
        <div className="bg-white shadow-1 rounded-[10px]">
          <div className="border-b border-gray-3 py-5 px-4 sm:px-5.5">
            <h3 className="">Bạn có mã giảm giá?</h3>
          </div>

          <div className="py-8 px-4 sm:px-8.5">
            {message && (
              <div className={`mb-4 p-3 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <div className="flex flex-wrap gap-4 xl:gap-5.5">
              <div className="max-w-[426px] w-full">
                <input
                  type="text"
                  name="coupon"
                  id="coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã giảm giá"
                  disabled={isLoading}
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex font-medium text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang xử lý...' : 'Áp dụng mã'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Discount;
