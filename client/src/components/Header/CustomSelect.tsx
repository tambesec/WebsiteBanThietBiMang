import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Option {
  label: string;
  value: string;
  slug?: string;
}

interface CustomSelectProps {
  options: Option[];
  onCategorySelect?: (option: Option) => void;
}

const CustomSelect = ({ options, onCategorySelect }: CustomSelectProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options[0]);

  // Update selected option when options change
  useEffect(() => {
    if (options && options.length > 0) {
      setSelectedOption(options[0]);
    }
  }, [options]);

  const toggleDropdown = () => {
    console.log('[CustomSelect] Toggle dropdown. Current isOpen:', isOpen);
    console.log('[CustomSelect] Options available:', options.length);
    console.log('[CustomSelect] Options:', options);
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: Option) => {
    console.log('[CustomSelect] Category selected:', option);
    setSelectedOption(option);
    toggleDropdown();
    
    // Navigate to shop with category filter
    if (option.value !== "0") {
      console.log('[CustomSelect] Navigating to shop with category_id:', option.value);
      router.push(`/shop?category_id=${option.value}`);
    } else {
      // "Danh mục" selected - go to shop without filter
      console.log('[CustomSelect] Navigating to shop without filter');
      router.push('/shop');
    }
  };

  console.log('[CustomSelect] Render - isOpen:', isOpen, 'options:', options.length);

  useEffect(() => {
    // closing modal while clicking outside
    function handleClickOutside(event) {
      if (!event.target.closest(".dropdown-content")) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="dropdown-content custom-select relative" style={{ width: "200px" }}>
      <div
        className={`select-selected whitespace-nowrap ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={toggleDropdown}
      >
        {selectedOption.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.length > 1 ? (
          options.slice(1).map((option, index) => {
            console.log('[CustomSelect] Rendering option:', option);
            return (
              <div
                key={index}
                onClick={() => handleOptionClick(option)}
                className={`select-item ${
                  selectedOption.value === option.value ? "same-as-selected" : ""
                }`}
              >
                {option.label}
              </div>
            );
          })
        ) : (
          <div className="px-4 py-2 text-sm text-gray-400">
            Đang tải danh mục...
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;
