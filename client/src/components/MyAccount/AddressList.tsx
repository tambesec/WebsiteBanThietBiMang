'use client';

import React, { useState, useEffect } from 'react';
import { addressesApi } from '@/lib/api-client';
import AddressModal from './AddressModal';

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

const AddressList = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressesApi.addressesControllerFindAll();
      // Backend: { data: [...] } - returns array directly
      const data = response.data?.data || response.data;
      setAddresses(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading addresses:', error);
      setAddresses([]);
      alert(error.message || 'Có lỗi khi tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleAddNew = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;

    try {
      await addressesApi.addressesControllerRemove(id);
      alert('Xóa địa chỉ thành công!');
      loadAddresses();
    } catch (error: any) {
      alert(error.message || 'Có lỗi khi xóa địa chỉ');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressesApi.addressesControllerSetDefault(id);
      alert('Đã đặt làm địa chỉ mặc định!');
      loadAddresses();
    } catch (error: any) {
      alert(error.message || 'Có lỗi khi đặt địa chỉ mặc định');
    }
  };

  const handleSave = async () => {
    setModalOpen(false);
    await loadAddresses();
  };

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case 'home': return 'Nhà riêng';
      case 'office': return 'Văn phòng';
      case 'other': return 'Khác';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-dark">Địa Chỉ Của Tôi</h3>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 font-medium text-white bg-blue py-3 px-6 rounded-lg hover:bg-blue-dark transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Thêm địa chỉ mới
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <svg className="w-16 h-16 text-gray-4 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-dark-5 text-lg mb-4">Bạn chưa có địa chỉ nào</p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 font-medium text-blue hover:text-blue-dark transition-colors"
          >
            Thêm địa chỉ đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                address.is_default ? 'ring-2 ring-blue' : ''
              }`}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-blue">
                    {getAddressTypeLabel(address.address_type)}
                  </span>
                  {address.is_default && (
                    <span className="px-3 py-1 bg-blue text-white rounded-full text-sm font-medium">
                      Mặc định
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <svg className="w-5 h-5 text-blue" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <svg className="w-5 h-5 text-red" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-dark">{address.recipient_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <p className="text-dark-5">{address.phone}</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-dark-5">
                    {address.address_line}
                    {address.ward && `, ${address.ward}`}
                    {address.district && `, ${address.district}`}
                    {`, ${address.city}`}
                    {address.postal_code && ` ${address.postal_code}`}
                  </p>
                </div>
                {!address.is_default && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="w-full mt-4 py-2 px-4 border-2 border-blue text-blue rounded-lg hover:bg-blue hover:text-white transition-colors font-medium"
                  >
                    Đặt làm mặc định
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressModal
        isOpen={modalOpen}
        closeModal={() => setModalOpen(false)}
        address={editingAddress}
        onSave={handleSave}
      />
    </div>
  );
};

export default AddressList;
