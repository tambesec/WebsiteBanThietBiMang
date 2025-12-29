import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * Email Service
 * Handles all email sending functionality
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  private initializeTransporter() {
    const host = this.configService.get<string>('email.host');
    const port = this.configService.get<number>('email.port');
    const user = this.configService.get<string>('email.user');
    const pass = this.configService.get<string>('email.pass');

    // Check if email is configured
    if (!host || !user || !pass) {
      this.logger.warn('Email service not configured. Email sending will be disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    // Verify connection
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error(`Email transporter error: ${error.message}`);
      } else {
        this.logger.log('Email transporter is ready');
      }
    });
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(
    email: string,
    fullName: string,
    verificationToken: string,
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`Email not configured. Verification token for ${email}: ${verificationToken}`);
      return false;
    }

    const frontendUrl = this.configService.get<string>('frontend.url') || 'https://www.netcompro.tech';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
    const fromEmail = this.configService.get<string>('email.from') || this.configService.get<string>('email.user');

    const mailOptions = {
      from: `"NetTechPro" <${fromEmail}>`,
      to: email,
      subject: '🔐 Xác thực địa chỉ email - NetTechPro',
      html: this.getVerificationEmailTemplate(fullName, verificationUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}: ${error.message}`);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    fullName: string,
    resetToken: string,
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`Email not configured. Reset token for ${email}: ${resetToken}`);
      return false;
    }

    const frontendUrl = this.configService.get<string>('frontend.url') || 'https://www.netcompro.tech';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    const fromEmail = this.configService.get<string>('email.from') || this.configService.get<string>('email.user');

    const mailOptions = {
      from: `"NetTechPro" <${fromEmail}>`,
      to: email,
      subject: '🔑 Đặt lại mật khẩu - NetTechPro',
      html: this.getPasswordResetEmailTemplate(fullName, resetUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}: ${error.message}`);
      return false;
    }
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(email: string, fullName: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`Email not configured. Welcome email skipped for ${email}`);
      return false;
    }

    const frontendUrl = this.configService.get<string>('frontend.url') || 'https://www.netcompro.tech';
    const fromEmail = this.configService.get<string>('email.from') || this.configService.get<string>('email.user');

    const mailOptions = {
      from: `"NetTechPro" <${fromEmail}>`,
      to: email,
      subject: '🎉 Chào mừng bạn đến với NetTechPro!',
      html: this.getWelcomeEmailTemplate(fullName, frontendUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}: ${error.message}`);
      return false;
    }
  }

  /**
   * Email verification template
   */
  private getVerificationEmailTemplate(fullName: string, verificationUrl: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Xác thực Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">NetTechPro</h1>
            <p style="color: #666; margin-top: 5px;">Thiết bị mạng chuyên nghiệp</p>
          </div>
          
          <h2 style="color: #333; margin-bottom: 20px;">Xin chào ${fullName}!</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Cảm ơn bạn đã đăng ký tài khoản tại NetTechPro. Để hoàn tất quá trình đăng ký và bảo mật tài khoản của bạn, vui lòng xác thực địa chỉ email bằng cách nhấn vào nút bên dưới:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Xác thực Email
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; margin-bottom: 10px;">
            Hoặc copy và paste đường link sau vào trình duyệt:
          </p>
          <p style="color: #2563eb; word-break: break-all; font-size: 12px; background-color: #f0f7ff; padding: 10px; border-radius: 5px;">
            ${verificationUrl}
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #888; font-size: 13px; margin: 0;">
              ⚠️ Link xác thực này sẽ hết hạn sau <strong>24 giờ</strong>.
            </p>
            <p style="color: #888; font-size: 13px; margin-top: 10px;">
              Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #999; font-size: 12px;">
            © 2024 NetTechPro. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Send payment success email
   */
  async sendPaymentSuccessEmail(
    email: string,
    fullName: string,
    paymentInfo: {
      orderNumber: string;
      amount: number;
      transactionId: string;
      paymentMethod: string;
    },
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email not configured, skipping payment success email');
      return;
    }

    const formattedAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(paymentInfo.amount);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const orderUrl = `${frontendUrl}/orders`;

    const html = this.getPaymentSuccessEmailTemplate(
      fullName,
      paymentInfo.orderNumber,
      formattedAmount,
      paymentInfo.transactionId,
      paymentInfo.paymentMethod,
      orderUrl,
    );

    try {
      await this.transporter.sendMail({
        from: `"NetTechPro" <${this.configService.get<string>('email.user')}>`,
        to: email,
        subject: `✅ Thanh toán thành công - Đơn hàng #${paymentInfo.orderNumber}`,
        html,
      });
      this.logger.log(`Payment success email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send payment success email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Payment success email template
   */
  private getPaymentSuccessEmailTemplate(
    fullName: string,
    orderNumber: string,
    amount: string,
    transactionId: string,
    paymentMethod: string,
    orderUrl: string,
  ): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thanh toán thành công</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">NetTechPro</h1>
            <p style="color: #666; margin-top: 5px;">Thiết bị mạng chuyên nghiệp</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px; color: white;">✓</span>
            </div>
            <h2 style="color: #10b981; margin-top: 15px;">Thanh toán thành công!</h2>
          </div>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Xin chào <strong>${fullName}</strong>, chúng tôi đã nhận được thanh toán của bạn.
          </p>
          
          <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #d1fae5;">Mã đơn hàng:</td>
                <td style="padding: 10px 0; color: #333; font-weight: bold; text-align: right; border-bottom: 1px solid #d1fae5;">#${orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #d1fae5;">Số tiền:</td>
                <td style="padding: 10px 0; color: #10b981; font-weight: bold; text-align: right; border-bottom: 1px solid #d1fae5;">${amount}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #d1fae5;">Mã giao dịch:</td>
                <td style="padding: 10px 0; color: #333; text-align: right; border-bottom: 1px solid #d1fae5;">${transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666;">Phương thức:</td>
                <td style="padding: 10px 0; color: #333; text-align: right;">${paymentMethod}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Đơn hàng của bạn đang được xử lý và sẽ được giao trong thời gian sớm nhất.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${orderUrl}" 
               style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Xem đơn hàng
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #999; font-size: 12px;">
            © 2024 NetTechPro. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Password reset email template
   */
  private getPasswordResetEmailTemplate(fullName: string, resetUrl: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đặt lại mật khẩu</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">NetTechPro</h1>
            <p style="color: #666; margin-top: 5px;">Thiết bị mạng chuyên nghiệp</p>
          </div>
          
          <h2 style="color: #333; margin-bottom: 20px;">Xin chào ${fullName}!</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào nút bên dưới để tạo mật khẩu mới:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Đặt lại mật khẩu
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; margin-bottom: 10px;">
            Hoặc copy và paste đường link sau vào trình duyệt:
          </p>
          <p style="color: #dc2626; word-break: break-all; font-size: 12px; background-color: #fef2f2; padding: 10px; border-radius: 5px;">
            ${resetUrl}
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #888; font-size: 13px; margin: 0;">
              ⚠️ Link đặt lại mật khẩu này sẽ hết hạn sau <strong>1 giờ</strong>.
            </p>
            <p style="color: #888; font-size: 13px; margin-top: 10px;">
              Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi nếu bạn lo ngại về bảo mật tài khoản.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #999; font-size: 12px;">
            © 2024 NetTechPro. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Welcome email template
   */
  private getWelcomeEmailTemplate(fullName: string, siteUrl: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chào mừng bạn!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🎉 NetTechPro</h1>
            <p style="color: #666; margin-top: 5px;">Thiết bị mạng chuyên nghiệp</p>
          </div>
          
          <h2 style="color: #333; margin-bottom: 20px;">Chào mừng ${fullName}!</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Email của bạn đã được xác thực thành công! Bây giờ bạn có thể tận hưởng đầy đủ các tính năng tại NetTechPro.
          </p>
          
          <div style="background-color: #f0f7ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #2563eb; margin-top: 0;">Bạn có thể:</h3>
            <ul style="color: #555; line-height: 1.8;">
              <li>🛒 Mua sắm các thiết bị mạng chất lượng cao</li>
              <li>📦 Theo dõi đơn hàng của bạn</li>
              <li>⭐ Đánh giá sản phẩm đã mua</li>
              <li>💰 Nhận các ưu đãi độc quyền</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${siteUrl}" 
               style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Bắt đầu mua sắm
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #999; font-size: 12px;">
            © 2024 NetTechPro. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}
