"use client";
import { useState, useEffect } from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

interface PriceDropdownProps {
  onPriceChange?: (min?: number, max?: number) => void;
  currentMin?: number;
  currentMax?: number;
}

const PriceDropdown = ({ onPriceChange, currentMin, currentMax }: PriceDropdownProps) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const maxPrice = 50000000; // 50 million VND

  const [selectedPrice, setSelectedPrice] = useState({
    from: currentMin || 0,
    to: currentMax || maxPrice,
  });

  // Update local state when props change
  useEffect(() => {
    setSelectedPrice({
      from: currentMin || 0,
      to: currentMax || maxPrice,
    });
  }, [currentMin, currentMax]);

  const handlePriceChange = (values: number[]) => {
    const from = Math.floor(values[0]);
    const to = Math.ceil(values[1]);
    setSelectedPrice({ from, to });
  };

  const handleApplyFilter = () => {
    if (onPriceChange) {
      const min = selectedPrice.from > 0 ? selectedPrice.from : undefined;
      const max = selectedPrice.to < maxPrice ? selectedPrice.to : undefined;
      onPriceChange(min, max);
    }
  };

  const handleClearFilter = () => {
    setSelectedPrice({ from: 0, to: maxPrice });
    if (onPriceChange) {
      onPriceChange(undefined, undefined);
    }
  };

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className="cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5"
      >
        <p className="text-dark">Giá</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setToggleDropdown(!toggleDropdown);
          }}
          id="price-dropdown-btn"
          aria-label="button for price dropdown"
          className={`text-dark ease-out duration-200 ${
            toggleDropdown && 'rotate-180'
          }`}
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      {/* // <!-- dropdown menu --> */}
      <div className={`p-6 ${toggleDropdown ? 'block' : 'hidden'}`}>
        <div id="pricingOne">
          <div className="price-range">
            <RangeSlider
              id="range-slider-gradient"
              className="margin-lg"
              step={'any'}
              min={0}
              max={maxPrice}
              value={[selectedPrice.from, selectedPrice.to]}
              onInput={handlePriceChange}
            />

            <div className="price-amount flex items-center justify-between pt-4">
              <div className="text-custom-xs text-dark-4 flex rounded border border-gray-3/80">
                <span className="block border-r border-gray-3/80 px-2.5 py-1.5">
                  đ
                </span>
                <span id="minAmount" className="block px-3 py-1.5">
                  {selectedPrice.from.toLocaleString('vi-VN')}
                </span>
              </div>

              <div className="text-custom-xs text-dark-4 flex rounded border border-gray-3/80">
                <span className="block border-r border-gray-3/80 px-2.5 py-1.5">
                  đ
                </span>
                <span id="maxAmount" className="block px-3 py-1.5">
                  {selectedPrice.to.toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={handleApplyFilter}
                className="flex-1 py-2 px-4 bg-blue text-white text-sm rounded hover:bg-blue/90 transition"
              >
                Áp dụng
              </button>
              <button
                type="button"
                onClick={handleClearFilter}
                className="py-2 px-4 border border-gray-3 text-dark text-sm rounded hover:bg-gray-1 transition"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceDropdown;
