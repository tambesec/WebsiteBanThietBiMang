"use client";

import { useState } from "react";
import { Metadata } from "next";

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqData = [
    {
      category: "Đặt Hàng & Thanh Toán",
      questions: [
        {
          question: "Làm thế nào để đặt hàng trên website?",
          answer: "Để đặt hàng, bạn chỉ cần: (1) Chọn sản phẩm và nhấn 'Thêm vào giỏ', (2) Vào giỏ hàng và nhấn 'Thanh toán', (3) Điền thông tin giao hàng, (4) Chọn phương thức thanh toán và xác nhận đơn hàng. Bạn sẽ nhận được email xác nhận ngay sau khi đặt hàng thành công."
        },
        {
          question: "NetTechPro hỗ trợ những hình thức thanh toán nào?",
          answer: "Chúng tôi hỗ trợ đa dạng phương thức thanh toán: Thanh toán khi nhận hàng (COD), Chuyển khoản ngân hàng, Thẻ tín dụng/ghi nợ (Visa, Mastercard), Ví điện tử (MoMo, ZaloPay, VNPay), và Quét mã QR."
        },
        {
          question: "Tôi có thể hủy đơn hàng sau khi đặt không?",
          answer: "Có, bạn có thể hủy đơn hàng miễn phí trong vòng 2 giờ sau khi đặt. Sau thời gian này, nếu đơn hàng đã được xử lý, bạn cần liên hệ hotline (+84) 123-456-789 để được hỗ trợ. Lưu ý: Đơn hàng đã giao không thể hủy, chỉ có thể đổi trả theo chính sách."
        },
        {
          question: "Tôi có thể thay đổi địa chỉ giao hàng sau khi đặt không?",
          answer: "Có, bạn có thể thay đổi địa chỉ giao hàng trước khi đơn hàng được gửi đi. Vui lòng liên hệ ngay với chúng tôi qua hotline hoặc email để cập nhật thông tin mới."
        }
      ]
    },
    {
      category: "Giao Hàng",
      questions: [
        {
          question: "Thời gian giao hàng mất bao lâu?",
          answer: "Thời gian giao hàng phụ thuộc vào khu vực: Nội thành Hà Nội/TP.HCM: 1-2 ngày, Tỉnh thành khác: 2-5 ngày, Vùng xa, hải đảo: 5-7 ngày. Bạn sẽ nhận được mã vận đơn để theo dõi đơn hàng."
        },
        {
          question: "Chi phí vận chuyển là bao nhiêu?",
          answer: "Phí vận chuyển được tính dựa trên khoảng cách và trọng lượng. Miễn phí ship cho đơn hàng từ 500.000đ (nội thành) và 1.000.000đ (tỉnh thành). Đơn hàng dưới mức này phí ship khoảng 15.000đ - 50.000đ tùy khu vực."
        },
        {
          question: "Tôi có thể nhận hàng tại cửa hàng không?",
          answer: "Có, chúng tôi hỗ trợ nhận hàng tại cửa hàng (miễn phí). Khi đặt hàng, vui lòng chọn hình thức 'Nhận tại cửa hàng' và đến lấy hàng trong giờ hành chính sau khi nhận được thông báo đơn hàng đã sẵn sàng."
        },
        {
          question: "Nếu không có nhà khi giao hàng thì sao?",
          answer: "Shipper sẽ liên hệ với bạn qua số điện thoại đã đăng ký. Nếu không liên lạc được, đơn hàng sẽ được giao lại vào hôm sau (tối đa 2 lần). Sau đó, hàng sẽ được hoàn về kho. Bạn cần liên hệ để sắp xếp giao lại (có thể phát sinh thêm phí)."
        }
      ]
    },
    {
      category: "Sản Phẩm",
      questions: [
        {
          question: "Làm thế nào để kiểm tra tình trạng hàng trong kho?",
          answer: "Tất cả sản phẩm trên website đều hiển thị tình trạng kho: 'Còn hàng', 'Sắp hết', hoặc 'Hết hàng'. Nếu sản phẩm hết hàng, bạn có thể đăng ký 'Thông báo khi có hàng' để nhận email khi sản phẩm về."
        },
        {
          question: "Sản phẩm có chính hãng và bảo hành không?",
          answer: "100% sản phẩm tại NetTechPro là chính hãng từ các nhà phân phối ủy quyền. Tất cả đều có tem chống giả, hóa đơn VAT và được bảo hành theo chính sách của nhà sản xuất (12-36 tháng tùy sản phẩm)."
        },
        {
          question: "Tôi cần tư vấn chọn sản phẩm phù hợp?",
          answer: "Đội ngũ kỹ thuật của chúng tôi luôn sẵn sàng tư vấn miễn phí. Bạn có thể: Gọi hotline (+84) 123-456-789, Chat trực tuyến trên website, Gửi email đến support@nettechpro.vn, hoặc Nhắn tin qua Facebook/Zalo."
        },
        {
          question: "Sản phẩm có đầy đủ phụ kiện không?",
          answer: "Mỗi sản phẩm đều kèm theo phụ kiện chuẩn từ nhà sản xuất (dây nguồn, adapter, anten, hướng dẫn sử dụng...). Chi tiết phụ kiện đi kèm được mô tả rõ ràng trên trang sản phẩm."
        }
      ]
    },
    {
      category: "Đổi Trả & Bảo Hành",
      questions: [
        {
          question: "Chính sách đổi trả của NetTechPro như thế nào?",
          answer: "Chúng tôi hỗ trợ đổi trả trong 7 ngày với sản phẩm lỗi, 3 ngày với sản phẩm giao sai/thiếu phụ kiện. Điều kiện: Sản phẩm còn nguyên tem, mác, chưa qua sử dụng, đầy đủ hộp và phụ kiện. Chi phí vận chuyển do NetTechPro chịu nếu lỗi từ nhà sản xuất."
        },
        {
          question: "Quy trình bảo hành diễn ra như thế nào?",
          answer: "Khi sản phẩm gặp lỗi trong thời gian bảo hành: (1) Liên hệ với chúng tôi qua hotline/email, (2) Gửi sản phẩm về (chúng tôi hỗ trợ ship về), (3) Kiểm tra và xác định lỗi (1-2 ngày), (4) Sửa chữa hoặc đổi mới (3-7 ngày), (5) Giao trả sản phẩm (miễn phí ship)."
        },
        {
          question: "Nếu sản phẩm lỗi sau thời gian bảo hành?",
          answer: "Sau thời gian bảo hành chính hãng, chúng tôi vẫn hỗ trợ sửa chữa có tính phí. Chi phí sẽ được báo giá trước khi sửa. Chúng tôi cam kết giá cả hợp lý và chất lượng sửa chữa tốt."
        },
        {
          question: "Tôi có thể đổi sang sản phẩm khác không?",
          answer: "Có, bạn có thể đổi sang sản phẩm khác trong vòng 3 ngày nếu sản phẩm không lỗi (chịu phí vận chuyển 2 chiều). Nếu sản phẩm mới có giá cao hơn, bạn bù thêm chênh lệch. Nếu thấp hơn, chúng tôi hoàn lại tiền thừa."
        }
      ]
    },
    {
      category: "Tài Khoản & Bảo Mật",
      questions: [
        {
          question: "Làm thế nào để tạo tài khoản?",
          answer: "Nhấn vào 'Đăng ký' ở góc phải trên cùng, điền thông tin (họ tên, email, mật khẩu), xác nhận email, và hoàn tất. Bạn cũng có thể đăng ký nhanh bằng tài khoản Google hoặc Facebook."
        },
        {
          question: "Tôi quên mật khẩu, làm sao để lấy lại?",
          answer: "Tại trang đăng nhập, nhấn 'Quên mật khẩu?', nhập email đăng ký, kiểm tra email và nhấn vào link đặt lại mật khẩu, tạo mật khẩu mới và đăng nhập."
        },
        {
          question: "Thông tin cá nhân của tôi có được bảo mật không?",
          answer: "Chúng tôi cam kết bảo mật 100% thông tin khách hàng. Website sử dụng mã hóa SSL, không chia sẻ thông tin với bên thứ ba, chỉ sử dụng thông tin cho mục đích giao dịch. Xem thêm tại Chính sách bảo mật."
        },
        {
          question: "Tôi có thể xóa tài khoản không?",
          answer: "Có, bạn có thể yêu cầu xóa tài khoản bằng cách gửi email đến privacy@nettechpro.vn. Chúng tôi sẽ xử lý trong 5-7 ngày làm việc. Lưu ý: Lịch sử đơn hàng và bảo hành vẫn được lưu theo quy định pháp luật."
        }
      ]
    },
    {
      category: "Khuyến Mãi & Ưu Đãi",
      questions: [
        {
          question: "Làm thế nào để sử dụng mã giảm giá?",
          answer: "Tại trang thanh toán, tìm ô 'Nhập mã giảm giá', nhập mã và nhấn 'Áp dụng'. Giảm giá sẽ được tính tự động vào tổng đơn hàng. Lưu ý: Mỗi đơn hàng chỉ áp dụng được 1 mã giảm giá."
        },
        {
          question: "Tôi có thể nhận ưu đãi từ đâu?",
          answer: "Bạn có thể nhận ưu đãi từ: Đăng ký nhận newsletter (email), Theo dõi Facebook/Zalo của NetTechPro, Tích điểm khi mua hàng, Giới thiệu bạn bè (cả hai đều nhận ưu đãi), Khuyến mãi theo ngày lễ, sự kiện đặc biệt."
        },
        {
          question: "Chương trình tích điểm hoạt động như thế nào?",
          answer: "Mỗi đơn hàng thành công, bạn nhận điểm tương ứng 1% giá trị đơn (VD: Mua 1.000.000đ = 10.000 điểm). Điểm có thể đổi thành mã giảm giá (10.000 điểm = 10.000đ) hoặc quà tặng đặc biệt. Điểm có hiệu lực 12 tháng."
        }
      ]
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main>
      <section className="overflow-hidden py-17.5 lg:py-22.5 xl:py-27.5">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Breadcrumb */}
          <div className="mb-10">
            <ul className="flex items-center gap-2">
              <li className="font-medium">
                <a href="/">Trang chủ</a>
              </li>
              <li className="font-medium">/ Câu Hỏi Thường Gặp</li>
            </ul>
          </div>

          {/* Header */}
          <div className="mb-12.5 text-center">
            <h1 className="mb-5 text-3xl font-bold text-dark xl:text-heading-3">
              Câu Hỏi Thường Gặp (FAQ)
            </h1>
            <p className="text-dark-2 max-w-2xl mx-auto">
              Tìm câu trả lời nhanh chóng cho các câu hỏi phổ biến về sản phẩm, đặt hàng, 
              giao hàng và chính sách của NetTechPro
            </p>
          </div>

          {/* Search Box */}
          <div className="mb-12.5 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm câu hỏi..."
                className="w-full px-6 py-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="space-y-8">
            {faqData.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-dark mb-6">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => {
                    const globalIndex = faqData
                      .slice(0, categoryIndex)
                      .reduce((acc, cat) => acc + cat.questions.length, 0) + faqIndex;
                    
                    return (
                      <div
                        key={faqIndex}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFAQ(globalIndex)}
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-dark pr-4">
                            {faq.question}
                          </span>
                          <svg
                            className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                              openIndex === globalIndex ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {openIndex === globalIndex && (
                          <div className="px-5 pb-5 text-dark-2 border-t border-gray-100 pt-4">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12.5 bg-blue-50 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-semibold text-dark mb-4">
              Không tìm thấy câu trả lời?
            </h3>
            <p className="text-dark-2 mb-6">
              Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Gửi Email
              </a>
              <a
                href="tel:+84123456789"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Gọi Hotline
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default FAQPage;
