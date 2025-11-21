import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính Sách Hoàn Tiền - NetTechPro",
  description: "Chính sách đổi trả và hoàn tiền của NetTechPro - Đảm bảo quyền lợi khách hàng",
};

const RefundPolicyPage = () => {
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
              <li className="font-medium">/ Chính Sách Hoàn Tiền</li>
            </ul>
          </div>

          {/* Header */}
          <div className="mb-12.5">
            <h1 className="mb-5 text-3xl font-bold text-dark xl:text-heading-3">
              Chính Sách Đổi Trả & Hoàn Tiền
            </h1>
            <p className="text-dark-2">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                1. Điều Kiện Đổi Trả
              </h2>
              <p className="mb-4 text-dark-2">
                NetTechPro chấp nhận đổi trả sản phẩm trong các trường hợp sau:
              </p>
              <ul className="list-disc pl-6 mb-4 text-dark-2 space-y-2">
                <li>Sản phẩm bị lỗi kỹ thuật do nhà sản xuất</li>
                <li>Sản phẩm không đúng với mô tả hoặc hình ảnh trên website</li>
                <li>Giao sai sản phẩm (không đúng mã, màu sắc, số lượng)</li>
                <li>Sản phẩm bị hư hỏng trong quá trình vận chuyển</li>
                <li>Sản phẩm thiếu phụ kiện hoặc quà tặng kèm theo</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                2. Thời Gian Đổi Trả
              </h2>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                <p className="text-dark font-semibold mb-2">Thời hạn đổi trả:</p>
                <ul className="list-disc pl-6 text-dark-2 space-y-1">
                  <li><strong>7 ngày</strong> kể từ ngày nhận hàng đối với sản phẩm lỗi</li>
                  <li><strong>3 ngày</strong> đối với sản phẩm giao sai hoặc thiếu phụ kiện</li>
                  <li><strong>1 ngày</strong> đối với sản phẩm bị hư hỏng do vận chuyển</li>
                </ul>
              </div>
              <p className="text-dark-2">
                <strong>Lưu ý:</strong> Đối với sản phẩm không lỗi, khách hàng muốn đổi sang sản phẩm khác, 
                thời gian đổi trả là <strong>3 ngày</strong> và khách hàng chịu phí vận chuyển 2 chiều.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                3. Quy Trình Đổi Trả
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark mb-2">Liên hệ với chúng tôi</h3>
                    <p className="text-dark-2">
                      Gọi hotline <strong>(+84) 123-456-789</strong> hoặc gửi email đến 
                      <strong> support@nettechpro.vn</strong> để thông báo đổi trả.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark mb-2">Chuẩn bị sản phẩm</h3>
                    <p className="text-dark-2">
                      Đóng gói sản phẩm cẩn thận kèm theo hóa đơn, phụ kiện và quà tặng (nếu có). 
                      Sản phẩm phải còn nguyên tem, mác, chưa qua sử dụng.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark mb-2">Gửi hàng hoàn trả</h3>
                    <p className="text-dark-2">
                      Chúng tôi sẽ sắp xếp đơn vị vận chuyển đến lấy hàng (miễn phí đối với sản phẩm lỗi) 
                      hoặc bạn có thể gửi trực tiếp về địa chỉ của chúng tôi.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark mb-2">Kiểm tra & xử lý</h3>
                    <p className="text-dark-2">
                      Sau khi nhận hàng, chúng tôi sẽ kiểm tra và xử lý trong vòng <strong>2-3 ngày làm việc</strong>. 
                      Bạn sẽ nhận được thông báo qua email/SMS về kết quả.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark mb-2">Hoàn tiền hoặc đổi hàng</h3>
                    <p className="text-dark-2">
                      Tiền sẽ được hoàn vào tài khoản của bạn trong 5-7 ngày làm việc. 
                      Nếu đổi hàng, sản phẩm mới sẽ được giao trong 2-3 ngày.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                4. Các Trường Hợp Không Áp Dụng Đổi Trả
              </h2>
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-dark-2 mb-2">Chúng tôi không chấp nhận đổi trả trong các trường hợp:</p>
                <ul className="list-disc pl-6 text-dark-2 space-y-2">
                  <li>Sản phẩm đã qua sử dụng, có dấu hiệu va đập, trầy xước</li>
                  <li>Sản phẩm không còn nguyên vẹn tem, mác, nhãn của nhà sản xuất</li>
                  <li>Thiếu phụ kiện, quà tặng đi kèm hoặc hóa đơn mua hàng</li>
                  <li>Lỗi do người dùng (rơi vỡ, vào nước, sử dụng sai cách)</li>
                  <li>Quá thời hạn đổi trả quy định</li>
                  <li>Sản phẩm đã qua sửa chữa tại nơi không được ủy quyền</li>
                  <li>Sản phẩm khuyến mãi, giảm giá đặc biệt (trừ trường hợp lỗi nhà sản xuất)</li>
                </ul>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                5. Hình Thức Hoàn Tiền
              </h2>
              <p className="mb-4 text-dark-2">
                Chúng tôi hỗ trợ các hình thức hoàn tiền sau:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-dark mb-2">💳 Chuyển khoản ngân hàng</h3>
                  <p className="text-dark-2 text-sm">
                    Hoàn tiền trực tiếp vào tài khoản ngân hàng của bạn trong 5-7 ngày làm việc
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-dark mb-2">💰 Ví điện tử</h3>
                  <p className="text-dark-2 text-sm">
                    Hoàn về ví MoMo, ZaloPay, VNPay trong 3-5 ngày làm việc
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-dark mb-2">🎁 Mã giảm giá</h3>
                  <p className="text-dark-2 text-sm">
                    Nhận mã giảm giá tương đương để sử dụng cho lần mua tiếp theo
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-dark mb-2">🔄 Đổi sản phẩm</h3>
                  <p className="text-dark-2 text-sm">
                    Đổi sang sản phẩm khác có giá trị tương đương hoặc bù trừ chênh lệch
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                6. Chi Phí Vận Chuyển
              </h2>
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">Trường hợp</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Chi phí vận chuyển</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Sản phẩm lỗi do nhà sản xuất</td>
                    <td className="border border-gray-300 px-4 py-2 text-green-600 font-semibold">Miễn phí 100%</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">Giao sai sản phẩm</td>
                    <td className="border border-gray-300 px-4 py-2 text-green-600 font-semibold">Miễn phí 100%</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Đổi sản phẩm khác (không lỗi)</td>
                    <td className="border border-gray-300 px-4 py-2 text-orange-600 font-semibold">Khách hàng thanh toán 2 chiều</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">Trả hàng (không lỗi)</td>
                    <td className="border border-gray-300 px-4 py-2 text-orange-600 font-semibold">Khách hàng thanh toán 2 chiều</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                7. Bảo Hành Sản Phẩm
              </h2>
              <p className="mb-4 text-dark-2">
                Tất cả sản phẩm tại NetTechPro đều được bảo hành theo chính sách của nhà sản xuất:
              </p>
              <ul className="list-disc pl-6 mb-4 text-dark-2 space-y-2">
                <li>Router, Switch, Access Point: Bảo hành 12-36 tháng</li>
                <li>Card mạng, USB Wifi: Bảo hành 12-24 tháng</li>
                <li>Phụ kiện (dây mạng, adapter): Bảo hành 6-12 tháng</li>
              </ul>
              <p className="text-dark-2">
                Trong thời gian bảo hành, nếu sản phẩm bị lỗi kỹ thuật, chúng tôi sẽ hỗ trợ sửa chữa 
                hoặc thay thế miễn phí (không áp dụng cho lỗi do người dùng).
              </p>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                Hỗ Trợ & Liên Hệ
              </h2>
              <p className="mb-4 text-dark-2">
                Nếu bạn có bất kỳ thắc mắc nào về chính sách đổi trả và hoàn tiền, vui lòng liên hệ:
              </p>
              <ul className="space-y-2 text-dark-2">
                <li><strong>Hotline:</strong> (+84) 123-456-789 (8:00 - 22:00 hàng ngày)</li>
                <li><strong>Email:</strong> support@nettechpro.vn</li>
                <li><strong>Facebook:</strong> facebook.com/nettechpro</li>
                <li><strong>Zalo:</strong> 0123456789</li>
              </ul>
              <p className="mt-4 text-dark-2 italic">
                NetTechPro cam kết bảo vệ quyền lợi của khách hàng và luôn sẵn sàng hỗ trợ 24/7!
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default RefundPolicyPage;
