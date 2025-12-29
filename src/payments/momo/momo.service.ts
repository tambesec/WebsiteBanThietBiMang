import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../email/email.service';

export type MomoRequestType = 'captureWallet' | 'payWithATM' | 'payWithCC' | 'payWithMethod';

export interface MomoPaymentRequest {
  orderId: string;
  orderInfo: string;
  amount: number;
  redirectUrl: string;
  ipnUrl: string;
  extraData?: string;
  items?: MomoItem[];
  userInfo?: MomoUserInfo;
  requestType?: MomoRequestType; // Default: payWithMethod (shows all 3 options)
}

export interface MomoItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  manufacturer?: string;
  price: number;
  currency: string;
  quantity: number;
  unit?: string;
  totalPrice: number;
  taxAmount?: number;
}

export interface MomoUserInfo {
  name: string;
  phoneNumber: string;
  email: string;
}

export interface MomoPaymentResponse {
  partnerCode: string;
  requestId: string;
  orderId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl: string;
  deeplink?: string;
  qrCodeUrl?: string;
  deeplinkMiniApp?: string;
}

export interface MomoIPNPayload {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

@Injectable()
export class MomoService {
  private readonly logger = new Logger(MomoService.name);
  private readonly partnerCode: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly endpoint: string;
  private readonly isProduction: boolean;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {
    this.isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    // Test credentials (sandbox)
    // Production: Get from https://business.momo.vn
    this.partnerCode =
      this.configService.get<string>('MOMO_PARTNER_CODE') || 'MOMO';
    this.accessKey =
      this.configService.get<string>('MOMO_ACCESS_KEY') || 'F8BBA842ECF85';
    this.secretKey =
      this.configService.get<string>('MOMO_SECRET_KEY') ||
      'K951B6PE1waDMi640xX08PD3vg6EkVlz';

    this.endpoint = this.isProduction
      ? 'https://payment.momo.vn'
      : 'https://test-payment.momo.vn';

    this.logger.log(
      `MoMo Service initialized - Environment: ${this.isProduction ? 'Production' : 'Sandbox'}`,
    );
  }

  /**
   * Create MoMo payment request
   * Docs: https://developers.momo.vn/v3/vi/docs/payment/api/wallet/onetime
   */
  async createPayment(request: MomoPaymentRequest): Promise<MomoPaymentResponse> {
    const requestId = `${request.orderId}_${Date.now()}`;
    // payWithMethod: Shows all 3 payment options (Ví MoMo, ATM, VISA/Master/JCB)
    // payWithATM: Only ATM/Bank card payment
    // captureWallet: QR code, deeplink, wallet payment
    // payWithCC: Credit card payment only
    const requestType = request.requestType || 'payWithMethod';
    const extraData = request.extraData || '';

    // Create signature (sorted a-z)
    // accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId
    // &orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    const rawSignature = `accessKey=${this.accessKey}&amount=${request.amount}&extraData=${extraData}&ipnUrl=${request.ipnUrl}&orderId=${request.orderId}&orderInfo=${request.orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${request.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    this.logger.debug(`Raw signature string: ${rawSignature}`);

    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId,
      amount: request.amount,
      orderId: request.orderId,
      orderInfo: request.orderInfo,
      redirectUrl: request.redirectUrl,
      ipnUrl: request.ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi',
      items: request.items,
      userInfo: request.userInfo,
    };

    this.logger.log(`Creating MoMo payment for order: ${request.orderId}`);
    this.logger.debug(`Request body: ${JSON.stringify(requestBody, null, 2)}`);

    try {
      const response = await axios.post(
        `${this.endpoint}/v2/gateway/api/create`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30s timeout as recommended
        },
      );

      this.logger.log(
        `MoMo response for order ${request.orderId}: ${JSON.stringify(response.data)}`,
      );

      if (response.data.resultCode !== 0) {
        this.logger.error(
          `MoMo payment creation failed: ${response.data.message}`,
        );
        throw new BadRequestException(
          `Không thể tạo thanh toán MoMo: ${response.data.message}`,
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`MoMo API error: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Lỗi kết nối đến MoMo. Vui lòng thử lại sau.',
      );
    }
  }

  /**
   * Verify IPN signature from MoMo
   */
  verifyIPNSignature(payload: MomoIPNPayload): boolean {
    // accessKey=$accessKey&amount=$amount&extraData=$extraData&message=$message&orderId=$orderId
    // &orderInfo=$orderInfo&orderType=$orderType&partnerCode=$partnerCode&payType=$payType
    // &requestId=$requestId&responseTime=$responseTime&resultCode=$resultCode&transId=$transId
    const rawSignature = `accessKey=${this.accessKey}&amount=${payload.amount}&extraData=${payload.extraData}&message=${payload.message}&orderId=${payload.orderId}&orderInfo=${payload.orderInfo}&orderType=${payload.orderType}&partnerCode=${payload.partnerCode}&payType=${payload.payType}&requestId=${payload.requestId}&responseTime=${payload.responseTime}&resultCode=${payload.resultCode}&transId=${payload.transId}`;

    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    const isValid = expectedSignature === payload.signature;

    if (!isValid) {
      this.logger.error(
        `Invalid IPN signature for order ${payload.orderId}. Expected: ${expectedSignature}, Got: ${payload.signature}`,
      );
    }

    return isValid;
  }

  /**
   * Handle IPN callback from MoMo
   * This is called by MoMo server when payment status changes
   */
  async handleIPN(payload: MomoIPNPayload): Promise<void> {
    this.logger.log(`Received MoMo IPN for order: ${payload.orderId}`);
    this.logger.debug(`IPN payload: ${JSON.stringify(payload)}`);

    // Verify signature
    if (!this.verifyIPNSignature(payload)) {
      throw new BadRequestException('Invalid IPN signature');
    }

    // Extract original order number from orderId
    // Retry payment uses format: {order_number}_R{timestamp}
    // Normal payment uses: {order_number}_{timestamp}
    let originalOrderNumber = payload.orderId;
    if (payload.orderId.includes('_R')) {
      // Retry payment case: extract order number before _R
      originalOrderNumber = payload.orderId.split('_R')[0];
    } else if (payload.orderId.includes('_')) {
      // Normal payment case: extract order number before first _
      originalOrderNumber = payload.orderId.split('_')[0];
    }

    // Find order by order_number
    const order = await this.prisma.orders.findFirst({
      where: { order_number: originalOrderNumber },
      include: {
        users: {
          select: { email: true, full_name: true },
        },
      },
    });

    if (!order) {
      this.logger.error(`Order not found: ${originalOrderNumber} (from orderId: ${payload.orderId})`);
      throw new BadRequestException('Order not found');
    }

    // Update payment status based on resultCode
    // 0 = Success, others = Failed
    const paymentStatus = payload.resultCode === 0 ? 'paid' : 'failed';
    const orderStatus = payload.resultCode === 0 ? 2 : 1; // 2 = Confirmed/Processing, 1 = Pending

    await this.prisma.$transaction(async (tx) => {
      // Update order
      await tx.orders.update({
        where: { id: order.id },
        data: {
          payment_status: paymentStatus,
          status_id: payload.resultCode === 0 ? orderStatus : order.status_id,
          momo_trans_id: payload.transId.toString(),
          momo_result_code: payload.resultCode,
          momo_message: payload.message,
          payment_time: payload.resultCode === 0 ? new Date() : null,
        },
      });

      // Add order history
      await tx.order_history.create({
        data: {
          order_id: order.id,
          status_id: orderStatus,
          note:
            payload.resultCode === 0
              ? `Thanh toán MoMo thành công. Mã giao dịch: ${payload.transId}`
              : `Thanh toán MoMo thất bại: ${payload.message}`,
          changed_by: order.user_id,
        },
      });
    });

    // Send email notification
    if (payload.resultCode === 0 && order.users?.email) {
      try {
        await this.emailService.sendPaymentSuccessEmail(
          order.users.email,
          order.users.full_name || 'Khách hàng',
          {
            orderNumber: order.order_number,
            amount: Number(order.total_amount),
            transactionId: payload.transId.toString(),
            paymentMethod: 'MoMo',
          },
        );
      } catch (error) {
        this.logger.error(`Failed to send payment success email: ${error.message}`);
      }
    }

    this.logger.log(
      `Order ${payload.orderId} payment status updated to: ${paymentStatus}`,
    );
  }

  /**
   * Handle payment return from MoMo redirect URL
   * This is a backup method for localhost testing when IPN cannot reach the server
   * Does not verify signature since return URL params may not include all IPN fields
   */
  async handlePaymentReturn(params: {
    orderId: string;
    resultCode: number;
    message: string;
    transId: number;
    amount: number;
    orderInfo: string;
    orderType: string;
    payType: string;
    responseTime: number;
    extraData: string;
    requestId: string;
    partnerCode: string;
    signature: string;
  }): Promise<void> {
    this.logger.log(`Processing payment return for order: ${params.orderId}`);

    // Extract original order number
    let originalOrderNumber = params.orderId;
    if (params.orderId.includes('_R')) {
      originalOrderNumber = params.orderId.split('_R')[0];
    } else if (params.orderId.includes('_')) {
      originalOrderNumber = params.orderId.split('_')[0];
    }

    // Find order by order_number
    const order = await this.prisma.orders.findFirst({
      where: { order_number: originalOrderNumber },
      include: {
        users: {
          select: { email: true, full_name: true },
        },
      },
    });

    if (!order) {
      this.logger.error(`Order not found: ${originalOrderNumber}`);
      throw new BadRequestException('Order not found');
    }

    // Skip if already paid (IPN may have already processed)
    if (order.payment_status === 'paid') {
      this.logger.log(`Order ${originalOrderNumber} already paid, skipping return processing`);
      return;
    }

    // Update payment status based on resultCode
    const paymentStatus = params.resultCode === 0 ? 'paid' : 'failed';
    const orderStatus = params.resultCode === 0 ? 2 : 1;

    await this.prisma.$transaction(async (tx) => {
      // Update order
      await tx.orders.update({
        where: { id: order.id },
        data: {
          payment_status: paymentStatus,
          status_id: params.resultCode === 0 ? orderStatus : order.status_id,
          momo_trans_id: params.transId?.toString() || null,
          momo_result_code: params.resultCode,
          momo_message: params.message,
          payment_time: params.resultCode === 0 ? new Date() : null,
        },
      });

      // Add order history
      await tx.order_history.create({
        data: {
          order_id: order.id,
          status_id: orderStatus,
          note:
            params.resultCode === 0
              ? `Thanh toán MoMo thành công. Mã giao dịch: ${params.transId}`
              : `Thanh toán MoMo thất bại: ${params.message}`,
          changed_by: order.user_id,
        },
      });
    });

    // Send email notification for successful payment
    if (params.resultCode === 0 && order.users?.email) {
      try {
        await this.emailService.sendPaymentSuccessEmail(
          order.users.email,
          order.users.full_name || 'Khách hàng',
          {
            orderNumber: order.order_number,
            amount: Number(order.total_amount),
            transactionId: params.transId?.toString() || '',
            paymentMethod: 'MoMo',
          },
        );
      } catch (error) {
        this.logger.error(`Failed to send payment success email: ${error.message}`);
      }
    }

    this.logger.log(
      `Order ${originalOrderNumber} payment status updated from return URL to: ${paymentStatus}`,
    );
  }

  /**
   * Query transaction status
   * Use when IPN is not received or need to verify
   */
  async queryTransaction(orderId: string, requestId: string): Promise<any> {
    const rawSignature = `accessKey=${this.accessKey}&orderId=${orderId}&partnerCode=${this.partnerCode}&requestId=${requestId}`;

    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId,
      orderId,
      signature,
      lang: 'vi',
    };

    try {
      const response = await axios.post(
        `${this.endpoint}/v2/gateway/api/query`,
        requestBody,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Query transaction error: ${error.message}`);
      throw new InternalServerErrorException(
        'Không thể kiểm tra trạng thái giao dịch',
      );
    }
  }

  /**
   * Get MoMo result code description
   */
  getResultCodeDescription(resultCode: number): string {
    const descriptions: Record<number, string> = {
      0: 'Thành công',
      9000: 'Giao dịch đã được xác nhận thành công',
      8000: 'Giao dịch đang chờ xử lý',
      7000: 'Giao dịch đang được xử lý',
      1000: 'Giao dịch đã được khởi tạo, chờ người dùng xác nhận',
      11: 'Truy cập bị từ chối',
      12: 'Phiên bản API không được hỗ trợ',
      13: 'Xác thực doanh nghiệp thất bại',
      20: 'Yêu cầu không hợp lệ',
      21: 'Số tiền không hợp lệ',
      40: 'RequestId trùng lặp',
      41: 'OrderId trùng lặp',
      42: 'OrderId không hợp lệ hoặc không tìm thấy',
      43: 'Yêu cầu bị từ chối do xung đột trong quá trình xử lý',
      1001: 'Thanh toán thất bại do tài khoản người dùng không đủ số dư',
      1002: 'Giao dịch bị từ chối do nhà phát hành tài khoản thanh toán',
      1003: 'Giao dịch bị hủy',
      1004: 'Giao dịch thất bại do số tiền vượt quá hạn mức thanh toán',
      1005: 'Giao dịch thất bại do url hoặc QR code đã hết hạn',
      1006: 'Giao dịch thất bại do người dùng đã từ chối xác nhận',
      1007: 'Giao dịch bị từ chối do tài khoản không tồn tại',
      1026: 'Giao dịch bị hạn chế theo thể lệ chương trình',
      1080: 'Giao dịch hoàn tiền bị từ chối',
      1081: 'Giao dịch hoàn tiền đã được thực hiện trước đó',
      2019: 'Yêu cầu bị từ chối do hoạt động bất thường',
      4001: 'Giao dịch bị hạn chế do chưa hoàn thành xác thực tài khoản',
      4100: 'Giao dịch thất bại do người dùng không đăng nhập thành công',
    };

    return descriptions[resultCode] || `Mã lỗi không xác định: ${resultCode}`;
  }
}
