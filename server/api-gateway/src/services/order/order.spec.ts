/*import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ClientGrpc } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { handleMappedError } from 'src/exceptions/error-handler';
import { OrderStatus, RefundStatus } from 'src/interfaces/order.interface';

jest.mock('src/exceptions/error-handler', () => ({
  handleMappedError: jest.fn(),
}));

const mockOrderServiceGrpc = {
  CreateOrder: jest.fn(),
  UpdateOrderStatus: jest.fn(),
  RequestRefund: jest.fn(),
  GetOrderHistory: jest.fn(),
  GetOrderStatus: jest.fn(),
  GetOrderById: jest.fn(),
  GetAllRefunds: jest.fn(),
  ChangeRefundStatus: jest.fn(),
};

const mockOrderServiceClient = {
  getService: jest.fn().mockReturnValue(mockOrderServiceGrpc),
};

describe('Order Service + Controller Unit Tests', () => {
  let controller: OrderController;
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [OrderService],
    })
      .overrideProvider('OrderClientOptions')
      .useValue(mockOrderServiceClient)
      .compile();

    service = module.get<OrderService>(OrderService);
    Object.defineProperty(service, 'orderServiceClient', {
      value: mockOrderServiceClient as unknown as ClientGrpc,
      writable: false,
    });
    service.onModuleInit();

    controller = module.get<OrderController>(OrderController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create order', async () => {
    mockOrderServiceGrpc.CreateOrder.mockReturnValueOnce(
      of({ orderId: 'abc123', status: true, message: 'Order placed' })
    );
    const result = await controller.createOrder({
      userId: 'u1',
      address: 'Test',
      cardInformation: '1111',
      items: [],
    });
    expect(result.status).toBe(true);
  });

  it('should fail gracefully if create order fails', async () => {
    mockOrderServiceGrpc.CreateOrder.mockReturnValueOnce(throwError(() => new Error('fail')));
    await service.createOrder({ userId: 'x', address: '', cardInformation: '', items: [] });
    expect(handleMappedError).toHaveBeenCalledWith('ORDER_CREATION_FAILED');
  });

  it('should update order status', async () => {
    mockOrderServiceGrpc.UpdateOrderStatus.mockReturnValueOnce(
      of({ orderId: 'abc123', status: true, message: 'Updated' })
    );
    const result = await controller.updateOrderStatus({ orderId: 'abc123', newStatus: OrderStatus.DELIVERED });
    expect(result.status).toBe(true);
  });

  it('should request refund', async () => {
    mockOrderServiceGrpc.RequestRefund.mockReturnValueOnce(
      of({ status: true, message: 'Refund requested', orderId: 'abc123', refundStatus: RefundStatus.PENDING })
    );
    const result = await controller.requestRefund({ orderId: 'abc123', userId: 'u1', reason: 'test' });
    expect(result.status).toBe(true);
  });

  it('should get order history', async () => {
    mockOrderServiceGrpc.GetOrderHistory.mockReturnValueOnce(
      of({ orders: [], status: true, message: 'Success' })
    );
    const result = await controller.getOrderHistory('u1');
    expect(result.orders).toEqual([]);
  });

  it('should get order status', async () => {
    mockOrderServiceGrpc.GetOrderStatus.mockReturnValueOnce(
      of({ orderStatus: OrderStatus.DELIVERED, status: true, message: 'Order delivered' })
    );
    const result = await controller.getOrderStatus('abc123');
    expect(result.orderStatus).toBe(OrderStatus.DELIVERED);
  });

  it('should get order by id', async () => {
    mockOrderServiceGrpc.GetOrderById.mockReturnValueOnce(
      of({
        orderId: '1',
        userId: 'u1',
        items: [],
        total: 200,
        orderStatus: OrderStatus.PROCESSING,
        createdAt: new Date().toISOString(),
        status: true,
        message: 'Order fetched',
        address: 'x',
      })
    );
    const result = await controller.getOrderById('1');
    expect(result.orderId).toBe('1');
  });

  it('should get all refunds', async () => {
    mockOrderServiceGrpc.GetAllRefunds.mockReturnValueOnce(
      of({ refunds: [], status: true, message: 'Fetched' })
    );
    const result = await controller.getAllRefundRequests();
    expect(result.status).toBe(true);
  });

  it('should change refund status', async () => {
    mockOrderServiceGrpc.ChangeRefundStatus.mockReturnValueOnce(
      of({ status: true, message: 'Updated' })
    );
    const result = await controller.changeRefundStatus({ refundId: 'r1', refundStatus: RefundStatus.APPROVED });
    expect(result.status).toBe(true);
  });
});

*/