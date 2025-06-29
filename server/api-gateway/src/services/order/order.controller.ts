import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  CreateOrderRequest,
  GetOrderHistoryRequest,
  GetOrderStatusRequest,
  GetOrderByIdRequest,
  getAllRefundsResponse,
  RequestRefundRequest,
  CancelOrderRequest,
  ChangeRefundRequest,
  RefundResponse,

  SingleRefundResponse,
  ChangeRefundStatusRequest,
  ChangeRefundStatusResponse,
  OrderHistoryResponse,
  GetOrderStatusResponse,
  GetOrderByIdResponse,
  OrderResponse,
  CancelOrderResponse,
} from '../../interfaces/order.interface';
import {
  CreateOrderDto,
  RequestRefundDto,
  UpdateOrderStatusDto,
  ChangeRefundStatusDto,
  CancelOrderDto,
} from 'src/dtos/order.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';
import { GetUserByIdRequest, GetUserByIdResponse } from 'src/interfaces/auth.interface';
import { AuthService } from '../auth/auth.service';
import { ProductService } from '../product/product-base.service';
import { CheckStockBeforeAddingRequest, CheckStockBeforeAddingResponse, IsProductAvailableInSizeRequest, IsProductAvailableInSizeResponse } from 'src/interfaces/product-base.interface';


@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly userService: AuthService,
    private readonly productService: ProductService, 
  ) {}

  
  @Get('refunds')
  async getAllRefundRequests(): Promise<getAllRefundsResponse> {
    return this.orderService.getAllRefundRequests();
  }

  @Post('create')
@UseGuards(AuthGuard)
async createOrder(
  @Body() body: CreateOrderDto,
  @Req() req: Request,
): Promise<OrderResponse> {
  const getUserByIdRequest: GetUserByIdRequest = {
    userId: req.user.id,
  };

  const availabilityChecks: Promise<CheckStockBeforeAddingResponse>[] = body.items.map((i) => {
    const data: CheckStockBeforeAddingRequest = {
      productId: i.productId,
      size: i.size,
      quantity: i.quantity,
    };

    return this.productService.checkStockBeforeAdding(data);
  });

  const availabilityResults = await Promise.all(availabilityChecks);

  const firstFailedCheck = availabilityResults.find(r => !r.status);
  if (firstFailedCheck) {
    return {
      orderId: "-1",
      status: false,
      message: firstFailedCheck.message || "Not enough items in the stock!",
    };
  }

  const user: GetUserByIdResponse = await this.userService.getUserById(getUserByIdRequest);

  const message: CreateOrderRequest = {
    userId: req.user.id,
    email: user.user?.email ?? '',
    userName: user.user?.username ?? '',
    address: body.address,
    cardInformation: body.cardInformation,
    items: body.items,
  };

  return this.orderService.createOrder(message);
}



  @Put('update-status')
  async updateOrderStatus(@Body() body: UpdateOrderStatusDto): Promise<OrderResponse> {
    return this.orderService.updateOrderStatus(body);
  }

  @Post('refund')
  @UseGuards(AuthGuard)
  async requestRefund(
    @Body() body: RequestRefundDto,
    @Req() req: Request,
  ): Promise<RefundResponse> {
    const message: RequestRefundRequest = {
      orderId: body.orderId,
      userId: req.user.id,
      reason: body.reason,
    };
    return this.orderService.requestRefund(message);
  }


  @Get('history/')
  @UseGuards(AuthGuard)
  async getOrderHistory(@Req() req : Request): Promise<OrderHistoryResponse> {
    if (req.user.role === 'admin') {
      return this.orderService.getOrderHistory({ userId: undefined } as any);
    }
    const userReq : GetOrderHistoryRequest = {
      userId : req.user.id
    }
    return this.orderService.getOrderHistory(userReq);
  }

  @Get('status/:orderId')
  async getOrderStatus(@Param('orderId') orderId: string): Promise<GetOrderStatusResponse> {
    const req: GetOrderStatusRequest = { orderId };
    return this.orderService.getOrderStatus(req);
  }
  @Get('/all-histories')
  async getAllOrderHistories() {
    const data = {}; 
    return this.orderService.getAllOrderHistories();
  }

  @Get('/:orderId')
  async getOrderById(@Param('orderId') orderId: string): Promise<GetOrderByIdResponse> {
    const req: GetOrderByIdRequest = { orderId };
    return this.orderService.getOrderById(req);
  }

  
  // >>>> Refund isteğini onaylamak için
  @Post('refunds/:refundId/approve')
  async approveRefund(
    @Param('refundId') refundId: string,
    @Body() body: { reviewerId: string },
  ): Promise<SingleRefundResponse> {
    const req: ChangeRefundRequest = { refundId, reviewerId: body.reviewerId };
    return this.orderService.approveRefund(req);
  }
  

  // >>>> Refund isteğini reddetmek için
  @Post('refunds/:refundId/reject')
  async rejectRefund(
    @Param('refundId') refundId: string,
    @Body() body: { reviewerId: string },
  ): Promise<SingleRefundResponse> {
    const req: ChangeRefundRequest = { refundId, reviewerId: body.reviewerId };
    return this.orderService.rejectRefund(req);
  }

  @Put('refunds/change-status')
  async changeRefundStatus(
    @Body() body: ChangeRefundStatusDto,
  ): Promise<ChangeRefundStatusResponse> {
    return this.orderService.changeRefundStatus({
      refundId: body.refundId,
      refundStatus: body.refundStatus,
    });
  }

  @Post('cancel')
  async cancelOrder(
    @Body() body: CancelOrderDto,
  ): Promise<CancelOrderResponse> {
    const req: CancelOrderRequest = {
      orderId: body.orderId,
      userId: body.userId,
      reason: body.reason,
    };
    return this.orderService.cancelOrder(req);
  }
}
