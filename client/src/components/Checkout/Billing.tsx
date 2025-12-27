import React, { useState, useEffect } from "react";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useAuth } from "@/contexts/AuthContext";
import { addressesApi } from "@/lib/api-client";

const Billing = () => {
  const { formData, updateFormData, errors } = useCheckout();
  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(true);

  // Load saved addresses on mount
  useEffect(() => {
    const loadAddresses = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await addressesApi.addressesControllerFindAll();
        const addresses = response.data?.data || response.data || [];
        setSavedAddresses(addresses);
        
        // Auto-select default address if exists
        const defaultAddr = addresses.find((a: any) => a.is_default === 1);
        if (defaultAddr && !formData.shippingAddressId) {
          handleSelectAddress(defaultAddr);
        }
      } catch (error) {
        console.error('Failed to load addresses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, [user]);

  const handleSelectAddress = (address: any) => {
    updateFormData({
      useExistingAddress: true,
      shippingAddressId: address.id,
      billingAddressId: address.id,
      recipientName: address.recipient_name || '',
      phone: address.phone || '',
      addressLine: address.address_line || '',
      city: address.city || '',
      district: address.district || '',
      ward: address.ward || '',
      postalCode: address.postal_code || '',
      addressType: address.address_type || 'home',
    });
    setShowNewAddressForm(false);
  };

  const handleNewAddress = () => {
    updateFormData({
      useExistingAddress: false,
      shippingAddressId: undefined,
      billingAddressId: undefined,
    });
    setShowNewAddressForm(true);
  };

  return (
    <div className="mt-9">
      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
        Thông tin thanh toán
      </h2>

      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
        {/* Address Selection */}
        {user && savedAddresses.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-dark mb-3">Chọn địa chỉ</h3>
            
            <div className="space-y-3">
              {savedAddresses.map((address: any) => (
                <label
                  key={address.id}
                  className="flex items-start gap-3 p-4 border border-gray-3 rounded-md cursor-pointer hover:border-blue hover:bg-gray-1 transition-colors"
                >
                  <input
                    type="radio"
                    name="selectedAddress"
                    checked={formData.shippingAddressId === address.id}
                    onChange={() => handleSelectAddress(address)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-dark">
                      {address.recipient_name}
                      {address.is_default === 1 && (
                        <span className="ml-2 text-xs bg-blue text-white px-2 py-0.5 rounded">
                          Mặc định
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-6 mt-1">{address.phone}</p>
                    <p className="text-sm text-gray-6">
                      {address.address_line}, {address.ward && `${address.ward}, `}
                      {address.district && `${address.district}, `}{address.city}
                    </p>
                  </div>
                </label>
              ))}

              <button
                type="button"
                onClick={handleNewAddress}
                className="w-full p-4 border border-dashed border-gray-3 rounded-md text-blue hover:border-blue hover:bg-gray-1 transition-colors"
              >
                + Sử dụng địa chỉ mới
              </button>
            </div>
          </div>
        )}

        {/* New Address Form (only show when needed) */}
        {showNewAddressForm && (
          <>
            <div className="mb-5">
          <label htmlFor="recipientName" className="block mb-2.5">
            Tên người nhận <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="recipientName"
            id="recipientName"
            value={formData.recipientName}
            onChange={(e) => updateFormData({ recipientName: e.target.value })}
            placeholder="Nhập tên người nhận"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
          {errors.recipientName && (
            <p className="text-red text-sm mt-1">{errors.recipientName}</p>
          )}
        </div>

        <div className="mb-5">
          <label htmlFor="phone" className="block mb-2.5">
            Số điện thoại <span className="text-red">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            placeholder="Nhập số điện thoại (10 số)"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
          {errors.phone && (
            <p className="text-red text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div className="mb-5">
          <label htmlFor="email" className="block mb-2.5">
            Địa chỉ Email <span className="text-red">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            placeholder="Nhập địa chỉ email"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
          {errors.email && (
            <p className="text-red text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div className="mb-5">
          <label htmlFor="addressLine" className="block mb-2.5">
            Địa chỉ <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="addressLine"
            id="addressLine"
            value={formData.addressLine}
            onChange={(e) => updateFormData({ addressLine: e.target.value })}
            placeholder="Số nhà, tên đường, phường/xã"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
          {errors.addressLine && (
            <p className="text-red text-sm mt-1">{errors.addressLine}</p>
          )}
        </div>

        <div className="mb-5">
          <label htmlFor="city" className="block mb-2.5">
            Thành phố / Tỉnh <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="city"
            id="city"
            value={formData.city}
            onChange={(e) => updateFormData({ city: e.target.value })}
            placeholder="Nhập tên thành phố hoặc tỉnh"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
          {errors.city && (
            <p className="text-red text-sm mt-1">{errors.city}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="district" className="block mb-2.5">
              Quận / Huyện
            </label>
            <input
              type="text"
              name="district"
              id="district"
              value={formData.district || ''}
              onChange={(e) => updateFormData({ district: e.target.value })}
              placeholder="Nhập quận hoặc huyện"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>

          <div className="w-full">
            <label htmlFor="ward" className="block mb-2.5">
              Phường / Xã
            </label>
            <input
              type="text"
              name="ward"
              id="ward"
              value={formData.ward || ''}
              onChange={(e) => updateFormData({ ward: e.target.value })}
              placeholder="Nhập phường hoặc xã"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>

        <div className="mb-5.5">
          <label htmlFor="postalCode" className="block mb-2.5">
            Mã bưu điện (không bắt buộc)
          </label>
          <input
            type="text"
            name="postalCode"
            id="postalCode"
            value={formData.postalCode || ''}
            onChange={(e) => updateFormData({ postalCode: e.target.value })}
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

export default Billing;
