"use client";
import React, { useState } from "react";
import Image from "next/image";
import axios from "axios";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !email.includes("@")) {
      setError("Vui lòng nhập email hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const response = await axios.post(`${API_URL}/api/v1/newsletter/subscribe`, {
        email: email.trim(),
      });

      setMessage(response.data.message || "Đăng ký thành công!");
      setEmail("");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative z-1 overflow-hidden rounded-xl">
          {/* <!-- bg shapes --> */}
          <Image
            src="/images/shapes/newsletter-bg.jpg"
            alt="background illustration"
            className="absolute -z-1 w-full h-full left-0 top-0 rounded-xl"
            width={1170}
            height={200}
          />
          <div className="absolute -z-1 max-w-[523px] max-h-[243px] w-full h-full right-0 top-0 bg-gradient-1"></div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 px-4 sm:px-7.5 xl:pl-12.5 xl:pr-14 py-11">
            <div className="max-w-[491px] w-full">
              <h2 className="max-w-[399px] text-white font-bold text-lg sm:text-xl xl:text-heading-4 mb-3">
                Đừng bỏ lỡ xu hướng và ưu đãi mới nhất
              </h2>
              <p className="text-white">
                Đăng ký để nhận tin tức về các ưu đãi và mã giảm giá mới nhất
              </p>
            </div>

            <div className="max-w-[477px] w-full">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập địa chỉ email của bạn"
                    className="w-full bg-gray-1 border border-gray-3 outline-none rounded-md placeholder:text-dark-4 py-3 px-5"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-3 px-7 text-white bg-blue font-medium rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang gửi..." : "Đăng ký"}
                  </button>
                </div>
                {message && (
                  <p className="mt-3 text-green-300 text-sm">{message}</p>
                )}
                {error && (
                  <p className="mt-3 text-red-300 text-sm">{error}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
