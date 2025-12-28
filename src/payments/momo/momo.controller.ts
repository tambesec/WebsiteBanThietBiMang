import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Logger,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { MomoService, MomoIPNPayload } from './momo.service';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Payments - MoMo')
@Controller('payments/momo')
export class MomoController {
  private readonly logger = new Logger(MomoController.name);
  private readonly frontendUrl: string;

  constructor(
    private momoService: MomoService,
    private configService: ConfigService,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
  }

  /**
   * IPN Callback from MoMo
   * This endpoint receives payment notifications from MoMo server
   */
  @Public()
  @Post('ipn')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'MoMo IPN Callback',
    description:
      'Receive payment notification from MoMo. This endpoint is called by MoMo server, not by client.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        partnerCode: { type: 'string' },
        orderId: { type: 'string' },
        requestId: { type: 'string' },
        amount: { type: 'number' },
        orderInfo: { type: 'string' },
        orderType: { type: 'string' },
        transId: { type: 'number' },
        resultCode: { type: 'number' },
        message: { type: 'string' },
        payType: { type: 'string' },
        responseTime: { type: 'number' },
        extraData: { type: 'string' },
        signature: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 204, description: 'IPN received successfully' })
  @ApiResponse({ status: 400, description: 'Invalid IPN data or signature' })
  async handleIPN(@Body() payload: MomoIPNPayload) {
    this.logger.log(`Received MoMo IPN: ${JSON.stringify(payload)}`);

    try {
      await this.momoService.handleIPN(payload);
      // Return 204 No Content to acknowledge receipt
      return;
    } catch (error) {
      this.logger.error(`IPN processing error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Redirect URL handler
   * User is redirected here after MoMo payment
   * Also updates payment status since IPN may not work on localhost
   */
  @Public()
  @Get('return')
  @ApiOperation({
    summary: 'MoMo Return URL',
    description:
      'Handle redirect from MoMo after payment. Verifies payment and redirects user to frontend with payment result.',
  })
  @ApiResponse({ status: 302, description: 'Redirect to frontend' })
  async handleReturn(
    @Query('orderId') orderId: string,
    @Query('resultCode') resultCode: string,
    @Query('message') message: string,
    @Query('transId') transId: string,
    @Query('amount') amount: string,
    @Query('signature') signature: string,
    @Query('orderInfo') orderInfo: string,
    @Query('orderType') orderType: string,
    @Query('payType') payType: string,
    @Query('responseTime') responseTime: string,
    @Query('extraData') extraData: string,
    @Query('requestId') requestId: string,
    @Query('partnerCode') partnerCode: string,
    @Res() res: Response,
  ) {
    this.logger.log(
      `MoMo return: orderId=${orderId}, resultCode=${resultCode}, transId=${transId}`,
    );

    // Extract original order number for retry payments
    // Retry payment uses format: {order_number}_R{timestamp}
    // Normal payment uses: {order_number}_{timestamp}
    let originalOrderNumber = orderId;
    if (orderId.includes('_R')) {
      originalOrderNumber = orderId.split('_R')[0];
    } else if (orderId.includes('_')) {
      originalOrderNumber = orderId.split('_')[0];
    }

    // Try to update payment status from return params (backup for IPN on localhost)
    // This ensures order gets updated even when IPN cannot reach localhost
    if (resultCode && transId) {
      try {
        await this.momoService.handlePaymentReturn({
          orderId,
          resultCode: parseInt(resultCode, 10),
          message: message || '',
          transId: parseInt(transId, 10) || 0,
          amount: parseInt(amount, 10) || 0,
          orderInfo: orderInfo || '',
          orderType: orderType || '',
          payType: payType || '',
          responseTime: parseInt(responseTime, 10) || Date.now(),
          extraData: extraData || '',
          requestId: requestId || '',
          partnerCode: partnerCode || '',
          signature: signature || '',
        });
        this.logger.log(`Payment status updated from return URL for order ${originalOrderNumber}`);
      } catch (error) {
        this.logger.warn(`Failed to update payment from return: ${error.message}`);
        // Continue to redirect even if update fails
      }
    }

    const status = resultCode === '0' ? 'success' : 'failed';
    const redirectUrl = `${this.frontendUrl}/payment/result?orderId=${originalOrderNumber}&status=${status}&transId=${transId || ''}&message=${encodeURIComponent(message || '')}`;

    return res.redirect(redirectUrl);
  }

  /**
   * Query transaction status
   */
  @Get('query')
  @ApiOperation({
    summary: 'Query MoMo Transaction',
    description: 'Query the status of a MoMo transaction',
  })
  @ApiResponse({ status: 200, description: 'Transaction status' })
  async queryTransaction(
    @Query('orderId') orderId: string,
    @Query('requestId') requestId?: string,
  ) {
    const reqId = requestId || `query_${orderId}_${Date.now()}`;
    const result = await this.momoService.queryTransaction(orderId, reqId);

    return {
      success: result.resultCode === 0,
      data: {
        orderId: result.orderId,
        amount: result.amount,
        transId: result.transId,
        resultCode: result.resultCode,
        message: result.message,
        description: this.momoService.getResultCodeDescription(result.resultCode),
      },
    };
  }

  /**
   * Get result code description
   */
  @Get('result-codes')
  @ApiOperation({
    summary: 'Get MoMo Result Code Description',
    description: 'Get human-readable description for MoMo result code',
  })
  getResultCodeDescription(@Query('code') code: string) {
    const resultCode = parseInt(code, 10);
    return {
      code: resultCode,
      description: this.momoService.getResultCodeDescription(resultCode),
    };
  }
}
