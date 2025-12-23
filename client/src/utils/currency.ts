// Utility function to format Vietnamese currency
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Alternative: Simple VND formatter without symbol
export const formatVNDSimple = (amount: number): string => {
  return amount.toLocaleString('vi-VN') + 'đ';
};
