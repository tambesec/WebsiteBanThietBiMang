"use client";
import React, { useState } from "react";

const SizeDropdown = () => {
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const [selectedSpeed, setSelectedSpeed] = useState("gigabit");
  
  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown && "shadow-filter"
        }`}
      >
        <p className="text-dark">Tốc Độ</p>
        <button
          onClick={() => setToggleDropdown(!toggleDropdown)}
          aria-label="button for speed dropdown"
          className={`text-dark ease-out duration-200 ${
            toggleDropdown && "rotate-180"
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
      <div
        className={`flex-wrap gap-2.5 p-6 ${
          toggleDropdown ? "flex" : "hidden"
        }`}
      >
        <label
          htmlFor="speed100"
          className={`cursor-pointer select-none flex items-center rounded-md ${selectedSpeed === "100mbps" ? "bg-blue text-white" : ""} hover:bg-blue hover:text-white`}
        >
          <div className="relative">
            <input type="radio" name="speed" id="speed100" className="sr-only" onChange={() => setSelectedSpeed("100mbps")} />
            <div className="text-custom-sm py-[5px] px-3.5 rounded-[5px]">
              100 Mbps
            </div>
          </div>
        </label>

        <label
          htmlFor="speedGigabit"
          className={`cursor-pointer select-none flex items-center rounded-md ${selectedSpeed === "gigabit" ? "bg-blue text-white" : ""} hover:bg-blue hover:text-white`}
        >
          <div className="relative">
            <input type="radio" name="speed" id="speedGigabit" className="sr-only" onChange={() => setSelectedSpeed("gigabit")} />
            <div className="text-custom-sm py-[5px] px-3.5 rounded-[5px]">
              Gigabit
            </div>
          </div>
        </label>

        <label
          htmlFor="speed2_5G"
          className={`cursor-pointer select-none flex items-center rounded-md ${selectedSpeed === "2.5g" ? "bg-blue text-white" : ""} hover:bg-blue hover:text-white`}
        >
          <div className="relative">
            <input type="radio" name="speed" id="speed2_5G" className="sr-only" onChange={() => setSelectedSpeed("2.5g")} />
            <div className="text-custom-sm py-[5px] px-3.5 rounded-[5px]">
              2.5G
            </div>
          </div>
        </label>

        <label
          htmlFor="speed10G"
          className={`cursor-pointer select-none flex items-center rounded-md ${selectedSpeed === "10g" ? "bg-blue text-white" : ""} hover:bg-blue hover:text-white`}
        >
          <div className="relative">
            <input type="radio" name="speed" id="speed10G" className="sr-only" onChange={() => setSelectedSpeed("10g")} />
            <div className="text-custom-sm py-[5px] px-3.5 rounded-[5px]">
              10G
            </div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default SizeDropdown;
