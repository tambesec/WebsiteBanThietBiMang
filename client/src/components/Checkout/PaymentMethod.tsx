import React from "react";
import Image from "next/image";
import { useCheckout } from "@/contexts/CheckoutContext";

const PaymentMethod = () => {
  const { formData, updateFormData } = useCheckout();

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Phương thức thanh toán</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-3">
          <label
            htmlFor="cod"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="radio"
                name="paymentMethod"
                id="cod"
                value="cod"
                checked={formData.paymentMethod === 'cod'}
                onChange={(e) => updateFormData({ paymentMethod: e.target.value as any })}
                className="sr-only"
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  formData.paymentMethod === 'cod'
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>

            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none min-w-[240px] ${
                formData.paymentMethod === 'cod'
                  ? "border-transparent bg-gray-2"
                  : " border-gray-4 shadow-1"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-2.5">
                  <Image src="/images/checkout/cash.svg" alt="cash" width={24} height={21}/>
                </div>

                <div className="border-l border-gray-4 pl-2.5">
                  <p>Thanh toán khi nhận hàng (COD)</p>
                </div>
              </div>
            </div>
          </label>

          <label
            htmlFor="momo"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="radio"
                name="paymentMethod"
                id="momo"
                value="momo"
                checked={formData.paymentMethod === 'momo'}
                onChange={(e) => updateFormData({ paymentMethod: e.target.value as any })}
                className="sr-only"
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  formData.paymentMethod === 'momo'
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>
            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none min-w-[240px] ${
                formData.paymentMethod === 'momo'
                  ? "border-transparent bg-gray-2"
                  : " border-gray-4 shadow-1"
              }`}
            >
              <div className="flex items-center">
                <div className="border-l border-gray-4 pl-2.5">
                  <p>Ví MoMo</p>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
