import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính Sách Bảo Mật - NetTechPro",
  description: "Chính sách bảo mật thông tin khách hàng của NetTechPro - Cam kết bảo vệ thông tin cá nhân của bạn",
};

const PrivacyPolicyPage = () => {
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
              <li className="font-medium">/ Chính Sách Bảo Mật</li>
            </ul>
          </div>

          {/* Header */}
          <div className="mb-12.5">
            <h1 className="mb-5 text-3xl font-bold text-dark xl:text-heading-3">
              Chính Sách Bảo Mật
            </h1>
            <p className="text-dark-2">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                1. Thu Thập Thông Tin
              </h2>
              <p className="mb-4 text-dark-2">
                NetTechPro thu thập thông tin cá nhân của bạn khi bạn:
              </p>
              <ul className="list-disc pl-6 mb-4 text-dark-2 space-y-2">
                <li>Đăng ký tài khoản trên website</li>
                <li>Đặt hàng sản phẩm hoặc dịch vụ</li>
                <li>Đăng ký nhận bản tin</li>
                <li>Tham gia khảo sát hoặc chương trình khuyến mãi</li>
                <li>Liên hệ với bộ phận chăm sóc khách hàng</li>
              </ul>
              <p className="text-dark-2">
                Thông tin thu thập có thể bao gồm: họ tên, địa chỉ email, số điện thoại, địa chỉ giao hàng, 
                thông tin thanh toán và các thông tin khác cần thiết để hoàn tất giao dịch.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                2. Sử Dụng Thông Tin
              </h2>
              <p className="mb-4 text-dark-2">
                Chúng tôi sử dụng thông tin của bạn để:
              </p>
              <ul className="list-disc pl-6 mb-4 text-dark-2 space-y-2">
                <li>Xử lý và giao hàng cho đơn hàng của bạn</li>
                <li>Gửi thông báo về đơn hàng và cập nhật trạng thái giao hàng</li>
                <li>Cung cấp dịch vụ chăm sóc khách hàng</li>
                <li>Gửi thông tin về sản phẩm mới, ưu đãi và chương trình khuyến mãi (nếu bạn đồng ý)</li>
                <li>Cải thiện trải nghiệm mua sắm và dịch vụ của chúng tôi</li>
                <li>Phát hiện và ngăn chặn gian lận</li>
                <li>Tuân thủ các nghĩa vụ pháp lý</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                3. Bảo Mật Thông Tin
              </h2>
              <p className="mb-4 text-dark-2">
                NetTechPro cam kết bảo vệ thông tin cá nhân của bạn bằng các biện pháp:
              </p>
              <ul className="list-disc pl-6 mb-4 text-dark-2 space-y-2">
                <li>Mã hóa SSL cho tất cả các giao dịch trực tuyến</li>
                <li>Lưu trữ dữ liệu trên máy chủ bảo mật</li>
                <li>Giới hạn quyền truy cập thông tin chỉ cho nhân viên được ủy quyền</li>
                <li>Thường xuyên kiểm tra và cập nhật các biện pháp bảo mật</li>
                <li>Không chia sẻ thông tin với bên thứ ba không được phép</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                4. Chia Sẻ Thông Tin
              </h2>
              <p className="mb-4 text-dark-2">
                Chúng tôi chỉ chia sẻ thông tin của bạn với:
              </p>
              <ul className="list-disc pl-6 mb-4 text-dark-2 space-y-2">
                <li><strong>Đối tác vận chuyển:</strong> Để giao hàng cho bạn</li>
                <li><strong>Cổng thanh toán:</strong> Để xử lý giao dịch thanh toán</li>
                <li><strong>Cơ quan pháp luật:</strong> Khi được yêu cầu theo quy định pháp luật</li>
              </ul>
              <p className="text-dark-2">
                Chúng tôi không bán, trao đổi hoặc chuyển giao thông tin cá nhân của bạn cho bên thứ ba 
                với mục đích thương mại mà không có sự đồng ý của bạn.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                5. Cookies
              </h2>
              <p className="mb-4 text-dark-2">
                Website của chúng tôi sử dụng cookies để:
              </p>
              <ul className="list-disc pl-6 mb-4 text-dark-2 space-y-2">
                <li>Ghi nhớ thông tin đăng nhập và giỏ hàng của bạn</li>
                <li>Hiểu cách bạn sử dụng website để cải thiện trải nghiệm</li>
                <li>Cá nhân hóa nội dung và quảng cáo</li>
              </ul>
              <p className="text-dark-2">
                Bạn có thể tắt cookies trong trình duyệt, nhưng điều này có thể ảnh hưởng đến một số 
                tính năng của website.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                6. Quyền Của Bạn
              </h2>
              <p className="mb-4 text-dark-2">
                Bạn có quyền:
              </p>
              <ul className="list-disc pl-6 mb-4 text-dark-2 space-y-2">
                <li>Truy cập và xem thông tin cá nhân của bạn</li>
                <li>Yêu cầu chỉnh sửa thông tin không chính xác</li>
                <li>Yêu cầu xóa thông tin cá nhân (trong một số trường hợp)</li>
                <li>Từ chối nhận email quảng cáo bằng cách nhấp vào link hủy đăng ký</li>
                <li>Khiếu nại với cơ quan quản lý nếu bạn cho rằng quyền riêng tư bị vi phạm</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                7. Thời Gian Lưu Trữ
              </h2>
              <p className="text-dark-2">
                Chúng tôi lưu trữ thông tin cá nhân của bạn trong thời gian cần thiết để:
              </p>
              <ul className="list-disc pl-6 mb-4 text-dark-2 space-y-2">
                <li>Thực hiện các mục đích đã nêu trong chính sách này</li>
                <li>Tuân thủ nghĩa vụ pháp lý (thường là 5-10 năm)</li>
                <li>Giải quyết tranh chấp và thực thi thỏa thuận</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                8. Liên Kết Bên Ngoài
              </h2>
              <p className="text-dark-2">
                Website của chúng tôi có thể chứa liên kết đến các trang web bên ngoài. 
                Chúng tôi không chịu trách nhiệm về chính sách bảo mật hoặc nội dung của các trang web đó. 
                Vui lòng đọc kỹ chính sách bảo mật của họ trước khi cung cấp thông tin cá nhân.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                9. Trẻ Em
              </h2>
              <p className="text-dark-2">
                Dịch vụ của chúng tôi không dành cho trẻ em dưới 16 tuổi. Chúng tôi không cố ý thu thập 
                thông tin cá nhân từ trẻ em. Nếu bạn là cha mẹ và phát hiện con bạn đã cung cấp thông tin 
                cho chúng tôi, vui lòng liên hệ để chúng tôi xóa thông tin đó.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                10. Thay Đổi Chính Sách
              </h2>
              <p className="text-dark-2">
                Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi sẽ được 
                công bố trên trang này với ngày cập nhật mới. Chúng tôi khuyến khích bạn xem lại chính sách 
                định kỳ để nắm rõ cách chúng tôi bảo vệ thông tin của bạn.
              </p>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg">
              <h2 className="mb-4 text-2xl font-semibold text-dark">
                Liên Hệ
              </h2>
              <p className="mb-4 text-dark-2">
                Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ với chúng tôi:
              </p>
              <ul className="space-y-2 text-dark-2">
                <li><strong>Email:</strong> privacy@nettechpro.vn</li>
                <li><strong>Điện thoại:</strong> (+84) 123-456-789</li>
                <li><strong>Địa chỉ:</strong> Việt Nam</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PrivacyPolicyPage;
