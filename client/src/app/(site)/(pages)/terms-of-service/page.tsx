import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Điều Khoản Sử Dụng - NetTechPro",
  description: "Điều khoản và điều kiện sử dụng dịch vụ của NetTechPro - Thiết bị mạng chất lượng cao",
};

const TermsOfServicePage = () => {
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
              <li className="font-medium">/ Điều Khoản Sử Dụng</li>
            </ul>
          </div>

          {/* Header */}
          <div className="mb-12.5">
            <h1 className="mb-5 text-3xl font-bold text-dark xl:text-heading-3">
              Điều Khoản Sử Dụng
            </h1>
            <p className="text-dark-2">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                1. Chấp Nhận Điều Khoản
              </h2>
              <p className="text-dark-2">
                Bằng việc truy cập và sử dụng website NetTechPro, bạn đồng ý tuân theo các điều khoản 
                và điều kiện sử dụng này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, 
                vui lòng không sử dụng dịch vụ của chúng tôi.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                2. Tài Khoản Người Dùng
              </h2>
              <p className="mb-4 text-dark-2">
                Khi đăng ký tài khoản, bạn cam kết:
              </p>
              <ul className="list-disc pl-6 mb-4 text-dark-2 space-y-2">
                <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật</li>
                <li>Bảo mật thông tin đăng nhập của bạn</li>
                <li>Chịu trách nhiệm với mọi hoạt động diễn ra dưới tài khoản của bạn</li>
                <li>Thông báo ngay cho chúng tôi nếu phát hiện việc sử dụng trái phép tài khoản</li>
                <li>Không sử dụng tài khoản cho mục đích bất hợp pháp hoặc gian lận</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                3. Sản Phẩm và Giá Cả
              </h2>
              <p className="mb-4 text-dark-2">
                Về sản phẩm và giá cả:
              </p>
              <ul className="list-disc pl-6 mb-4 text-dark-2 space-y-2">
                <li>Tất cả sản phẩm được mô tả và hiển thị trên website chỉ mang tính chất tham khảo</li>
                <li>Giá cả có thể thay đổi mà không cần thông báo trước</li>
                <li>Chúng tôi không chịu trách nhiệm về các lỗi hiển thị về giá hoặc mô tả sản phẩm</li>
                <li>Sản phẩm có thể hết hàng bất cứ lúc nào</li>
                <li>Chúng tôi có quyền từ chối hoặc hủy đơn hàng nếu phát hiện vi phạm</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                4. Đặt Hàng và Thanh Toán
              </h2>
              <p className="mb-4 text-dark-2">
                Khi đặt hàng, bạn đồng ý:
              </p>
              <ul className="list-disc pl-6 mb-4 text-dark-2 space-y-2">
                <li>Cung cấp thông tin giao hàng chính xác và đầy đủ</li>
                <li>Thanh toán đầy đủ theo phương thức đã chọn</li>
                <li>Nhận hàng theo địa chỉ đã cung cấp</li>
                <li>Kiểm tra hàng hóa khi nhận và thông báo ngay nếu có vấn đề</li>
              </ul>
              <p className="text-dark-2">
                Đơn hàng chỉ được xác nhận sau khi thanh toán thành công và có sự xác nhận 
                từ NetTechPro.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                5. Giao Hàng
              </h2>
              <p className="mb-4 text-dark-2">
                Về giao hàng:
              </p>
              <ul className="list-disc pl-6 mb-4 text-dark-2 space-y-2">
                <li>Thời gian giao hàng chỉ mang tính chất ước tính</li>
                <li>Chúng tôi không chịu trách nhiệm về các trường hợp chậm trễ do bên vận chuyển</li>
                <li>Khách hàng cần có mặt để nhận hàng tại địa chỉ đã đăng ký</li>
                <li>Phí vận chuyển sẽ được tính dựa trên khoảng cách và trọng lượng</li>
                <li>Miễn phí vận chuyển cho đơn hàng trên 500,000 VNĐ</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                6. Đổi Trả và Hoàn Tiền
              </h2>
              <p className="mb-4 text-dark-2">
                Chính sách đổi trả:
              </p>
              <ul className="list-disc pl-6 mb-4 text-dark-2 space-y-2">
                <li>Sản phẩm có thể đổi trả trong vòng 7 ngày kể từ ngày nhận hàng</li>
                <li>Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng</li>
                <li>Có đầy đủ hóa đơn, phụ kiện và bao bì</li>
                <li>Không áp dụng cho sản phẩm đã qua sử dụng hoặc bị hư hỏng do người dùng</li>
                <li>Chi tiết xem tại <a href="/refund-policy" className="text-blue hover:underline">Chính sách hoàn tiền</a></li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                7. Bảo Hành
              </h2>
              <p className="text-dark-2">
                Tất cả sản phẩm được bảo hành theo chính sách của nhà sản xuất. NetTechPro hỗ trợ 
                làm cầu nối giữa khách hàng và nhà sản xuất trong quá trình bảo hành. Thời gian và 
                điều kiện bảo hành tùy theo từng sản phẩm cụ thể.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                8. Quyền Sở Hữu Trí Tuệ
              </h2>
              <p className="mb-4 text-dark-2">
                Tất cả nội dung trên website bao gồm:
              </p>
              <ul className="list-disc pl-6 mb-4 text-dark-2 space-y-2">
                <li>Logo, hình ảnh, văn bản, đồ họa</li>
                <li>Thiết kế website và mã nguồn</li>
                <li>Thương hiệu và nhãn hiệu</li>
              </ul>
              <p className="text-dark-2">
                Đều thuộc quyền sở hữu của NetTechPro hoặc các bên cấp phép. Nghiêm cấm sao chép, 
                phân phối hoặc sử dụng mà không có sự cho phép bằng văn bản.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                9. Giới Hạn Trách Nhiệm
              </h2>
              <p className="text-dark-2">
                NetTechPro không chịu trách nhiệm về:
              </p>
              <ul className="list-disc pl-6 mb-4 text-dark-2 space-y-2">
                <li>Thiệt hại trực tiếp hoặc gián tiếp phát sinh từ việc sử dụng website</li>
                <li>Gián đoạn hoặc lỗi kỹ thuật của website</li>
                <li>Mất mát dữ liệu hoặc thông tin</li>
                <li>Hành động của bên thứ ba (vận chuyển, thanh toán, v.v.)</li>
                <li>Thiệt hại do sử dụng sai mục đích sản phẩm</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                10. Thay Đổi Điều Khoản
              </h2>
              <p className="text-dark-2">
                NetTechPro có quyền thay đổi các điều khoản này bất cứ lúc nào. Các thay đổi sẽ 
                có hiệu lực ngay khi được đăng tải trên website. Việc bạn tiếp tục sử dụng dịch vụ 
                sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                11. Luật Điều Chỉnh
              </h2>
              <p className="text-dark-2">
                Các điều khoản này được điều chỉnh bởi luật pháp Việt Nam. Mọi tranh chấp phát sinh 
                sẽ được giải quyết thông qua thương lượng hoặc tại tòa án có thẩm quyền tại Việt Nam.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                12. Liên Hệ
              </h2>
              <p className="mb-4 text-dark-2">
                Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng này, vui lòng liên hệ:
              </p>
              <ul className="list-none pl-0 text-dark-2 space-y-2">
                <li><strong>Email:</strong> contact@nettechpro.vn</li>
                <li><strong>Điện thoại:</strong> (+84) 123-456-789</li>
                <li><strong>Địa chỉ:</strong> Việt Nam</li>
              </ul>
            </div>

            <div className="p-6 bg-gray-1 rounded-lg border-l-4 border-blue">
              <p className="text-dark-2">
                <strong>Lưu ý:</strong> Bằng việc sử dụng website NetTechPro, bạn xác nhận rằng 
                đã đọc, hiểu và đồng ý với tất cả các điều khoản và điều kiện nêu trên.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TermsOfServicePage;
