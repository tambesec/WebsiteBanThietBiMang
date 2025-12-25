"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";

const HeroCarousal = () => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      <SwiperSlide>
        <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
          <div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
            <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
              <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                30%
              </span>
              <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                Sale
                <br />
                Off
              </span>
            </div>

            <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
              <a href="/shop?category=router">Router WiFi 6 Asus RT-AX55 - Tốc độ vượt trội</a>
            </h1>

            <p>
            Trải nghiệm mạng không dây thế hệ mới với WiFi 6, tốc độ lên đến 1800Mbps. Phủ sóng rộng, kết nối ổn định cho mọi không gian.
            </p>

            <a
              href="/shop?category=router"
              className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
            >
              Mua ngay
            </a>
          </div>

          <div>
            <Image
              src="https://res.cloudinary.com/diysxuomq/image/upload/v1766674132/rt_asus_ocs2ch.png"
              alt="router wifi 6"
              width={351}
              height={358}
            />
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        {" "}
        <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
          <div className="max-w-[394px] py-10 sm:py-15 lg:py-26 pl-4 sm:pl-7.5 lg:pl-12.5">
            <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
              <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                30%
              </span>
              <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                Sale
                <br />
                Off
              </span>
            </div>

            <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
              <a href="/shop?category=bo-phat-song-wifi">Hệ thống Mesh WiFi TP-Link Deco M5 - Phủ sóng toàn diện</a>
            </h1>

            <p>
              Giải pháp WiFi Mesh thông minh, tự động chuyển đổi điểm phát. Phủ sóng đến 500m², không gian chết, kết nối liền mạch.
            </p>

            <a
              href="/shop?category=bo-phat-song-wifi"
              className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
            >
              Khám phá ngay
            </a>
          </div>

          <div>
            <Image
              src="https://res.cloudinary.com/diysxuomq/image/upload/v1766674132/rt_asus_ocs2ch.png"
              alt="mesh wifi system"
              width={351}
              height={358}
            />
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  );
};

export default HeroCarousal;
