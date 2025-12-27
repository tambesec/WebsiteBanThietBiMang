'use client';

import React, { useEffect, useState } from "react";
import { addressesApi } from '@/lib/api-client';
import type { CreateAddressDto, UpdateAddressDto } from '@/lib/api-client';

interface Address {
  id: number;
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  district?: string;
  ward?: string;
  postal_code?: string;
  address_type: 'home' | 'office' | 'other';
  is_default: boolean;
}

interface AddressModalProps {
  isOpen: boolean;
  closeModal: () => void;
  address?: Address | null;
  onSave: () => void;
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, closeModal, address, onSave }) => {
  const [formData, setFormData] = useState<CreateAddressDto | UpdateAddressDto>({
    recipient_name: '',
    phone: '',
    address_line: '',
    city: '',
    district: '',
    ward: '',
    postal_code: '',
    address_type: 'home',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (address) {
      setFormData({
        recipient_name: address.recipient_name,
        phone: address.phone,
        address_line: address.address_line,
        city: address.city,
        district: address.district || '',
        ward: address.ward || '',
        postal_code: address.postal_code || '',
        address_type: address.address_type,
      });
    } else {
      setFormData({
        recipient_name: '',
        phone: '',
        address_line: '',
        city: '',
        district: '',
        ward: '',
        postal_code: '',
        address_type: 'home',
      });
    }
  }, [address, isOpen]);

  useEffect(() => {
    // closing modal while clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest(".modal-content")) {
        closeModal();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeModal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (address) {
        // Update existing address
        await addressesApi.addressesControllerUpdate(address.id, formData as UpdateAddressDto);
        alert('Cập nhật địa chỉ thành công!');
      } else {
        // Create new address
        await addressesApi.addressesControllerCreate(formData as CreateAddressDto);
        alert('Thêm địa chỉ mới thành công!');
      }
      onSave();
      closeModal();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi lưu địa chỉ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 2xl:py-[230px] bg-dark/70 sm:px-8 px-4 py-5 ${
        isOpen ? "block z-99999" : "hidden"
      }`}
    >
      <div className="flex items-center justify-center ">
        <div
          x-show="addressModal"
          className="w-full max-w-[1100px] rounded-xl shadow-3 bg-white p-7.5 relative modal-content"
        >
          <button
            onClick={closeModal}
            aria-label="button for close modal"
            className="absolute top-0 right-0 sm:top-3 sm:right-3 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-meta text-body hover:text-dark"
          >
            <svg
              className="fill-current"
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z"
                fill=""
              />
            </svg>
          </button>

          <div>
            <h3 className="text-2xl font-bold text-dark mb-6">
              {address ? 'Chỉnh Sửa Địa Chỉ' : 'Thêm Địa Chỉ Mới'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                <div className="w-full">
                  <label htmlFor="recipient_name" className="block mb-2.5">
                    Tên người nhận <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    id="recipient_name"
                    name="recipient_name"
                    value={formData.recipient_name}
                    onChange={handleChange}
                    required
                    placeholder="Nhập tên người nhận"
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="phone" className="block mb-2.5">
                    Số điện thoại <span className="text-red">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Nhập số điện thoại"
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label htmlFor="address_line" className="block mb-2.5">
                  Địa chỉ <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  id="address_line"
                  name="address_line"
                  value={formData.address_line}
                  onChange={handleChange}
                  required
                  placeholder="Số nhà, tên đường, phường/xã"
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                <div className="w-full">
                  <label htmlFor="city" className="block mb-2.5">
                    Thành phố / Tỉnh <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="Nhập thành phố hoặc tỉnh"
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="district" className="block mb-2.5">
                    Quận / Huyện
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district || ''}
                    onChange={handleChange}
                    placeholder="Nhập quận hoặc huyện"
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                <div className="w-full">
                  <label htmlFor="ward" className="block mb-2.5">
                    Phường / Xã
                  </label>
                  <input
                    type="text"
                    id="ward"
                    name="ward"
                    value={formData.ward || ''}
                    onChange={handleChange}
                    placeholder="Nhập phường hoặc xã"
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="postal_code" className="block mb-2.5">
                    Mã bưu điện
                  </label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code || ''}
                    onChange={handleChange}
                    placeholder="Nhập mã bưu điện"
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label htmlFor="address_type" className="block mb-2.5">
                  Loại địa chỉ <span className="text-red">*</span>
                </label>
                <select
                  id="address_type"
                  name="address_type"
                  value={formData.address_type}
                  onChange={handleChange as any}
                  required
                  className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                >
                  <option value="home">Nhà riêng</option>
                  <option value="office">Văn phòng</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:bg-gray-4 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu địa chỉ'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex font-medium text-dark bg-gray-2 py-3 px-7 rounded-md ease-out duration-200 hover:bg-gray-3"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
