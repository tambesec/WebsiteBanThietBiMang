import React from "react";
import Image from "next/image";

const PromoBanner = () => {
  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- promo banner big --> */}
        <div className="relative z-1 overflow-hidden rounded-lg bg-[#F5F5F7] py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5">
          <div className="max-w-[550px] w-full">
            <span className="block font-medium text-xl text-dark mb-3">
              Switch Cisco Catalyst 9300 Series
            </span>

            <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5">
              GIẢM ĐẾN 30%
            </h2>

            <p>
              Switch cấp doanh nghiệp hiệu suất cao, hỗ trợ StackWise Virtual, tốc độ chuyển mạch lên đến 960 Gbps. Giải pháp mạng hoàn hảo cho doanh nghiệp.
            </p>

            <a
              href="/shop?search=cisco+catalyst"
              className="inline-flex font-medium text-custom-sm text-white bg-blue py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
            >
              Mua ngay
            </a>
          </div>

          <Image
            src="https://res.cloudinary.com/diysxuomq/image/upload/v1766584086/cisco_switch_flkejt.png"
            alt="Cisco Catalyst Switch"
            className="absolute top-1/2 -translate-y-1/2 right-4 lg:right-16 -z-1"
            width={380}
            height={280}
          />
        </div>

        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          {/* <!-- promo banner small --> */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-[#DBF4F3] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
            <Image
              src="https://res.cloudinary.com/diysxuomq/image/upload/v1766584345/fgt_gmw34y.png"
              alt="Fortinet FortiGate Firewall"
              className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-10 -z-1"
              width={241}
              height={241}
            />

            <div className="text-right">
              <span className="block text-lg text-dark mb-1.5">
                Fortinet FortiGate Firewall
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                Bảo mật mạng toàn diện
              </h2>

              <p className="font-semibold text-custom-1 text-teal">
                Giảm 20%
              </p>

              <a
                href="/shop?search=fortinet"
                className="inline-flex font-medium text-custom-sm text-white bg-teal py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-teal-dark mt-9"
              >
                Xem ngay
              </a>
            </div>
          </div>

          {/* <!-- promo banner small --> */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-[#FFECE1] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
            <Image
              src="https://res.cloudinary.com/diysxuomq/image/upload/v1766583894/iu_uqjwj0.png"
              alt="Ubiquiti UniFi 6 Access Point"
              className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-8.5 -z-1"
              width={200}
              height={200}
            />

            <div>
              <span className="block text-lg text-dark mb-1.5">
                Ubiquiti UniFi 6 Long-Range
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                Giảm đến <span className="text-orange">40%</span>
              </h2>

              <p className="max-w-[285px] text-custom-sm">
                Access Point WiFi 6 tầm xa 183m, công suất cao. Tốc độ 3.0 Gbps, hoàn hảo cho không gian rộng lớn.
              </p>

              <a
                href="/shop?search=ubiquiti+unifi"
                className="inline-flex font-medium text-custom-sm text-white bg-orange py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-orange-dark mt-7.5"
              >
                Mua ngay
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
