'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ordersApi, addressesApi } from '@/lib/api-client';
import type { CreateOrderDto } from '@/lib/api-client';

interface CheckoutFormData {
  // Existing address selection
  useExistingAddress: boolean;
  shippingAddressId?: number;
  billingAddressId?: number;
  
  // New address info (if creating new)
  recipientName: string;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  district?: string;
  ward?: string;
  postalCode?: string;
  addressType: 'home' | 'office' | 'other';
  
  // Shipping (if different from billing)
  useDifferentShipping: boolean;
  shippingRecipientName?: string;
  shippingPhone?: string;
  shippingAddressLine?: string;
  shippingCity?: string;
  shippingDistrict?: string;
  shippingWard?: string;
  shippingPostalCode?: string;
  
  // Order info
  paymentMethod: 'cod' | 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
  shippingMethod: 'standard' | 'express' | 'same_day';
  customerNote?: string;
  discountCode?: string;
}

interface CheckoutContextType {
  formData: CheckoutFormData;
  updateFormData: (data: Partial<CheckoutFormData>) => void;
  submitOrder: () => Promise<any>;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

const initialFormData: CheckoutFormData = {
  useExistingAddress: false,
  shippingAddressId: undefined,
  billingAddressId: undefined,
  recipientName: '',
  phone: '',
  email: '',
  addressLine: '',
  city: '',
  district: '',
  ward: '',
  postalCode: '',
  addressType: 'home',
  useDifferentShipping: false,
  paymentMethod: 'cod',
  shippingMethod: 'standard',
  customerNote: '',
  discountCode: '',
};

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<CheckoutFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (data: Partial<CheckoutFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    // Clear errors for updated fields
    const updatedKeys = Object.keys(data);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedKeys.forEach(key => delete newErrors[key]);
      return newErrors;
    });
  };

  // Basic UI validation only (không phải business logic)
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // If using existing address, only check that address ID exists
    if (formData.useExistingAddress) {
      if (!formData.shippingAddressId) {
        newErrors.general = 'Vui lòng chọn địa chỉ giao hàng';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    // If creating new address, validate form fields
    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Vui lòng nhập tên người nhận';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    }
    if (!formData.addressLine.trim()) {
      newErrors.addressLine = 'Vui lòng nhập địa chỉ';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Vui lòng nhập thành phố/tỉnh';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitOrder = async () => {
    // Basic UI validation only
    if (!validateForm()) {
      throw new Error('Vui lòng kiểm tra lại thông tin');
    }

    setIsSubmitting(true);
    try {
      let shippingAddressId: number;
      let billingAddressId: number;

      // Step 1: Create or use existing addresses
      if (formData.useExistingAddress && formData.shippingAddressId) {
        // Use existing addresses
        shippingAddressId = formData.shippingAddressId;
        billingAddressId = formData.billingAddressId || formData.shippingAddressId;
      } else {
        // Create new billing address
        const billingAddressData: any = {
          recipient_name: formData.recipientName,
          phone: formData.phone,
          address_line: formData.addressLine,
          city: formData.city,
          district: formData.district,
          ward: formData.ward,
          postal_code: formData.postalCode,
          address_type: formData.addressType,
        };

        const billingResponse = await addressesApi.addressesControllerCreate(billingAddressData);
        const billingAddr = billingResponse.data?.data || billingResponse.data;
        billingAddressId = billingAddr.id;

        // Create shipping address if different
        if (formData.useDifferentShipping && formData.shippingAddressLine) {
          const shippingAddressData: any = {
            recipient_name: formData.shippingRecipientName || formData.recipientName,
            phone: formData.shippingPhone || formData.phone,
            address_line: formData.shippingAddressLine,
            city: formData.shippingCity || formData.city,
            district: formData.shippingDistrict,
            ward: formData.shippingWard,
            postal_code: formData.shippingPostalCode,
            address_type: 'home',
          };

          const shippingResponse = await addressesApi.addressesControllerCreate(shippingAddressData);
          const shippingAddr = shippingResponse.data?.data || shippingResponse.data;
          shippingAddressId = shippingAddr.id;
        } else {
          // Use billing address for shipping
          shippingAddressId = billingAddressId;
        }
      }

      // Step 2: Create order with address IDs
      const orderData: CreateOrderDto = {
        shipping_address_id: shippingAddressId,
        billing_address_id: billingAddressId,
        payment_method: formData.paymentMethod,
        shipping_method: formData.shippingMethod,
        customer_phone: formData.phone,
        discount_code: formData.discountCode || undefined,
        customer_note: formData.customerNote || undefined,
      };

      const response = await ordersApi.ordersControllerCreate(orderData);
      const order = response.data?.data || response.data;
      
      // Reset form on success
      setFormData(initialFormData);
      
      return order;
    } catch (error: any) {
      console.error('Create order error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo đơn hàng';
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CheckoutContext.Provider
      value={{
        formData,
        updateFormData,
        submitOrder,
        isSubmitting,
        errors,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
