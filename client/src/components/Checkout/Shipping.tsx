import React from "react";
import { useCheckout } from "@/contexts/CheckoutContext";

const Shipping = () => {
  const { formData, updateFormData, errors } = useCheckout();

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="p-4 sm:p-8.5">
        <label className="text-dark flex cursor-pointer select-none items-center mb-5">
          <input
            type="checkbox"
            checked={formData.useShippingAddress}
            onChange={(e) => updateFormData({ useShippingAddress: e.target.checked })}
            className="mr-2"
          />
          <span className="font-medium text-lg">
            Giao hàng tới địa chỉ khác? (Nếu khác với địa chỉ thanh toán)
          </span>
        </label>

        {formData.useShippingAddress && (
          <>
            <div className="mb-5">
              <label htmlFor="shippingRecipientName" className="block mb-2.5">
                Tên người nhận <span className="text-red">*</span>
              </label>
              <input
                type="text"
                name="shippingRecipientName"
                id="shippingRecipientName"
                value={formData.shippingRecipientName || ''}
                onChange={(e) => updateFormData({ shippingRecipientName: e.target.value })}
                placeholder="Nhập tên người nhận"
                className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />
              {errors.shippingRecipientName && (
                <p className="text-red text-sm mt-1">{errors.shippingRecipientName}</p>
              )}
            </div>

            <div className="mb-5">
              <label htmlFor="shippingPhone" className="block mb-2.5">
                Số điện thoại <span className="text-red">*</span>
              </label>
              <input
                type="tel"
                name="shippingPhone"
                id="shippingPhone"
                value={formData.shippingPhone || ''}
                onChange={(e) => updateFormData({ shippingPhone: e.target.value })}
                placeholder="Nhập số điện thoại (10 số)"
                className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />
              {errors.shippingPhone && (
                <p className="text-red text-sm mt-1">{errors.shippingPhone}</p>
              )}
            </div>

            <div className="mb-5">
              <label htmlFor="shippingAddressLine" className="block mb-2.5">
                Địa chỉ <span className="text-red">*</span>
              </label>
              <input
                type="text"
                name="shippingAddressLine"
                id="shippingAddressLine"
                value={formData.shippingAddressLine || ''}
                onChange={(e) => updateFormData({ shippingAddressLine: e.target.value })}
                placeholder="Số nhà, tên đường, phường/xã"
                className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />
              {errors.shippingAddressLine && (
                <p className="text-red text-sm mt-1">{errors.shippingAddressLine}</p>
              )}
            </div>

            <div className="mb-5">
              <label htmlFor="shippingCity" className="block mb-2.5">
                Thành phố / Tỉnh <span className="text-red">*</span>
              </label>
              <input
                type="text"
                name="shippingCity"
                id="shippingCity"
                value={formData.shippingCity || ''}
                onChange={(e) => updateFormData({ shippingCity: e.target.value })}
                placeholder="Nhập tên thành phố hoặc tỉnh"
                className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />
              {errors.shippingCity && (
                <p className="text-red text-sm mt-1">{errors.shippingCity}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 mb-5">
              <div className="w-full">
                <label htmlFor="shippingDistrict" className="block mb-2.5">
                  Quận / Huyện
                </label>
                <input
                  type="text"
                  name="shippingDistrict"
                  id="shippingDistrict"
                  value={formData.shippingDistrict || ''}
                  onChange={(e) => updateFormData({ shippingDistrict: e.target.value })}
                  placeholder="Nhập quận hoặc huyện"
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="w-full">
                <label htmlFor="shippingWard" className="block mb-2.5">
                  Phường / Xã
                </label>
                <input
                  type="text"
                  name="shippingWard"
                  id="shippingWard"
                  value={formData.shippingWard || ''}
                  onChange={(e) => updateFormData({ shippingWard: e.target.value })}
                  placeholder="Nhập phường hoặc xã"
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="shippingPostalCode" className="block mb-2.5">
                Mã bưu điện (không bắt buộc)
              </label>
              <input
                type="text"
                name="shippingPostalCode"
                id="shippingPostalCode"
                value={formData.shippingPostalCode || ''}
                onChange={(e) => updateFormData({ shippingPostalCode: e.target.value })}
                placeholder="Nhập mã bưu điện"
                className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Shipping;
