/*import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { getModelToken } from '@nestjs/mongoose';
import { ClientKafka } from '@nestjs/microservices';
import { Order } from './models/order.model';
import { Refund } from './models/refund.model';
import { OrderStatus, RefundStatus } from './interfaces/order.interface';

// Mock Mongoose models
const mockOrderModel = {
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

const mockRefundModel = {
  create: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

// Mock Kafka
const mockKafkaClient = {
  emit: jest.fn(),
  connect: jest.fn(),
};

describe('PaymentService Unit Tests (Bug-Oriented & Positive)', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
        {
          provide: getModelToken(Refund.name),
          useValue: mockRefundModel,
        },
        {
          provide: 'KAFKA_SERVICE',
          useValue: mockKafkaClient,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);

    // Reset all mocks before each test
    jest.clearAllMocks();

    // Optional: Kafka client connect mock
    (mockKafkaClient.connect as jest.Mock).mockResolvedValue(true);
  });

  // -----------------------------------------------
  // createOrder()
  // -----------------------------------------------
  describe('createOrder()', () => {
    it('should fail if card is invalid', async () => {
      const request = {
        userId: 'U1',
        address: 'Test Address',
        cardInformation: 'invalid-card-info',
        items: [{ productId: 'p1', quantity: 2, price: 50 }],
        size :"32", 
      };
      const result = await service.createOrder(request);
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/Invalid card/i);
      expect(mockOrderModel.create).not.toHaveBeenCalled();
    });

    it('should fail if total is 0 (all items priced 0)', async () => {
      const request = {
        userId: 'U2',
        address: 'Sneaker Street',
        cardInformation: '1234123412341234 123 12/34', // valid enough
        items: [{ productId: 'p1', quantity: 1, price: 0 }],
      };
      // Even if create is never called
      const result = await service.createOrder(request);
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/Total must be greater than 0/i);
      expect(mockOrderModel.create).not.toHaveBeenCalled();
    });

    it('should fail gracefully if DB throws error', async () => {
      const request = {
        userId: 'U3',
        address: 'Nowhere',
        cardInformation: '1111222233334444 123 01/30',
        items: [{ productId: 'pX', quantity: 2, price: 20 }],
      };
      (mockOrderModel.create as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('DB error');
      });

      const result = await service.createOrder(request);
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/DB error/i);
    });

    it('should succeed and emit Kafka event on success', async () => {
      const request = {
        userId: 'U4',
        address: 'Some St',
        cardInformation: '1111222233334444 999 12/30',
        items: [{ productId: 'p2', quantity: 1, price: 100 }],
      };
      (mockOrderModel.create as jest.Mock).mockResolvedValueOnce({
        _id: 'someOrderId',
      });

      const result = await service.createOrder(request);
      expect(result.status).toBe(true);
      expect(result.orderId).toBe('someOrderId');
      expect(mockKafkaClient.emit).toHaveBeenCalledWith('payment-approved', {
        order: request,
      });
    });

    it('should fail if savedOrder is null', async () => {
      const request = {
        userId: 'U5',
        address: 'Null Street',
        cardInformation: '4444111122223333 345 02/29',
        items: [{ productId: 'p55', quantity: 1, price: 55 }],
      };
      (mockOrderModel.create as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.createOrder(request);
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/error occured/i);
    });
  });

  // -----------------------------------------------
  // updateOrderStatus()
  // -----------------------------------------------
  describe('updateOrderStatus()', () => {
    it('should update order status successfully', async () => {
      (mockOrderModel.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce({
        _id: 'order123',
        status: 'DELIVERED',
      });

      const result = await service.updateOrderStatus({
        orderId: 'order123',
        newStatus: 'DELIVERED',
      });
      expect(result.status).toBe(true);
      expect(result.message).toContain('updated to DELIVERED');
    });

    it('should fail if order not found', async () => {
      (mockOrderModel.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(null);
      const result = await service.updateOrderStatus({
        orderId: 'orderNotFound',
        newStatus: 'ONWAY',
      });
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/not found/i);
    });

    it('should fail if DB error occurs', async () => {
      (mockOrderModel.findByIdAndUpdate as jest.Mock).mockImplementationOnce(() => {
        throw new Error('DB update error');
      });

      const result = await service.updateOrderStatus({
        orderId: 'x123',
        newStatus: 'ONWAY',
      });
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/failed to update/i);
    });
  });

  // -----------------------------------------------
  // requestRefund()
  // -----------------------------------------------
  describe('requestRefund()', () => {
    it('should fail if request payload is invalid', async () => {
      const result = await service.requestRefund(null as any);
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/invalid refund request payload/i);
    });

    it('should fail if order not found', async () => {
      (mockOrderModel.findById as jest.Mock).mockResolvedValueOnce(null);
      const result = await service.requestRefund({
        orderId: 'xxx',
        userId: 'U55',
        reason: 'any reason',
      });
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/No order found/i);
    });

    it('should fail if refund already exists', async () => {
      (mockOrderModel.findById as jest.Mock).mockResolvedValueOnce({ _id: 'xx' });
      (mockRefundModel.findOne as jest.Mock).mockResolvedValueOnce({
        _id: 'existingRefund',
      });
      const result = await service.requestRefund({
        orderId: 'xx',
        userId: 'YY',
        reason: 'Test reason',
      });
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/Refund request already exists/i);
    });

    it('should succeed if everything is normal', async () => {
      (mockOrderModel.findById as jest.Mock).mockResolvedValueOnce({ _id: 'orderX' });
      (mockRefundModel.findOne as jest.Mock).mockResolvedValueOnce(null);
      (mockRefundModel.create as jest.Mock).mockResolvedValueOnce({
        orderId: 'orderX',
        status: RefundStatus.PENDING,
      });

      const result = await service.requestRefund({
        orderId: 'orderX',
        userId: 'UU',
        reason: 'OMG defective item!',
      });
      expect(result.status).toBe(true);
      expect(result.message).toMatch(/Refund request submitted/i);
    });

    it('should fail if DB error occurs', async () => {
      (mockOrderModel.findById as jest.Mock).mockResolvedValueOnce({ _id: 'OK' });
      (mockRefundModel.findOne as jest.Mock).mockResolvedValueOnce(null);
      (mockRefundModel.create as jest.Mock).mockImplementationOnce(() => {
        throw new Error('DB fail');
      });

      const result = await service.requestRefund({
        orderId: 'OK',
        userId: 'X',
        reason: 'some reason',
      });
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/unknown error/i);
    });
  });

  // -----------------------------------------------
  // getOrderHistory()
  // -----------------------------------------------
  describe('getOrderHistory()', () => {
    it('should succeed and return order summaries', async () => {
      (mockOrderModel.find as jest.Mock).mockResolvedValueOnce([
        {
          _id: 'ord1',
          status: OrderStatus.DELIVERED,
          createdAt: new Date('2020-01-01'),
          deliveredAt: new Date('2020-01-03'),
          total: 200,
          items: [{ productId: 'p1', quantity: 2 }],
        },
      ]);
      const result = await service.getOrderHistory({ userId: 'U123' });
      expect(result.status).toBe(true);
      expect(result.orders.length).toBe(1);
      expect(result.orders[0].orderId).toBe('ord1');
    });

    it('should fail if find returns null or error', async () => {
      (mockOrderModel.find as jest.Mock).mockResolvedValueOnce(null);
      const result = await service.getOrderHistory({ userId: 'X' });
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/failed to fetch orders/i);
    });

    it('should handle DB error', async () => {
      (mockOrderModel.find as jest.Mock).mockImplementationOnce(() => {
        throw new Error('DB error');
      });
      const result = await service.getOrderHistory({ userId: 'X' });
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/failed to retrieve order history/i);
    });
  });

  // -----------------------------------------------
  // getOrderStatus()
  // -----------------------------------------------
  describe('getOrderStatus()', () => {
    it('should return the order status successfully', async () => {
      (mockOrderModel.findById as jest.Mock).mockResolvedValueOnce({
        _id: 'xxx',
        status: 'ONWAY',
      });
      const result = await service.getOrderStatus({ orderId: 'xxx' });
      expect(result.status).toBe(true);
      expect(result.orderStatus).toBe('ONWAY');
    });

    it('should fail if order not found', async () => {
      (mockOrderModel.findById as jest.Mock).mockResolvedValueOnce(null);
      const result = await service.getOrderStatus({ orderId: 'nope' });
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/not found/i);
    });

    it('should fail if DB error occurs', async () => {
      (mockOrderModel.findById as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Find error');
      });
      const result = await service.getOrderStatus({ orderId: 'Z' });
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/failed to retrieve/i);
    });
  });

  // -----------------------------------------------
  // getOrderById()
  // -----------------------------------------------
  describe('getOrderById()', () => {
    it('should return order details if found', async () => {
      (mockOrderModel.findById as jest.Mock).mockResolvedValueOnce({
        _id: 'ordXXX',
        userId: 'UserXYZ',
        address: 'Sneaker Av.',
        total: 999,
        status: OrderStatus.ONWAY,
        createdAt: new Date('2021-05-05'),
        items: [{ productId: 'p1', quantity: 3 }],
      });
      const result = await service.getOrderById({ orderId: 'ordXXX' });
      expect(result.status).toBe(true);
      expect(result.orderId).toBe('ordXXX');
      expect(result.userId).toBe('UserXYZ');
    });

    it('should fail if not found', async () => {
      (mockOrderModel.findById as jest.Mock).mockResolvedValueOnce(null);
      const result = await service.getOrderById({ orderId: 'no' });
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/Order not found/i);
    });

    it('should fail if DB error', async () => {
      (mockOrderModel.findById as jest.Mock).mockImplementationOnce(() => {
        throw new Error('DB find error');
      });
      const result = await service.getOrderById({ orderId: 'someid' });
      expect(result.status).toBe(false);
      expect(result.message).toMatch("Failed to retrieve order by ID");
    });
  });

  // -----------------------------------------------
  // getAllRefunds()
  // -----------------------------------------------
  describe('getAllRefunds()', () => {
    it('should list all refunds successfully', async () => {
      (mockRefundModel.find as jest.Mock).mockResolvedValueOnce([
        { _id: 'r1', orderId: 'ord1', reason: 'whatever', userId: 'U1' },
      ]);
      // For each refund, we do orderModel.findById => mock it
      (mockOrderModel.findById as jest.Mock).mockResolvedValueOnce({
        createdAt: new Date('2020-01-02'),
        items: [{ productId: '777', quantity: 1 }],
      });

      const result = await service.getAllRefunds();
      expect(result.status).toBe(true);
      expect(result.refunds[0].refundId).toBe('r1');
      expect(result.refunds[0].productIds).toContain(777);
    });

    it('should return error if find returns null or something fails', async () => {
      (mockRefundModel.find as jest.Mock).mockResolvedValueOnce(null);
      const result = await service.getAllRefunds();
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/error occured during fetch/i);
    });
  });

  // -----------------------------------------------
  // changeRefundStatus()
  // -----------------------------------------------
  describe('changeRefundStatus()', () => {
    it('should succeed changing refund status', async () => {
      (mockRefundModel.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce({
        _id: 'rX',
        status: RefundStatus.APPROVED,
      });
      const result = await service.changeRefundStatus({
        refundId: 'rX',
        refundStatus: RefundStatus.APPROVED,
      });
      expect(result.status).toBe(true);
      expect(result.message).toMatch(/updated to APPROVED/i);
    });

    it('should fail if refund not found', async () => {
      (mockRefundModel.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(null);
      const result = await service.changeRefundStatus({
        refundId: 'notfound',
        refundStatus: RefundStatus.REJECTED,
      });
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/Refund not found/i);
    });

    it('should fail if DB error occurs', async () => {
      (mockRefundModel.findByIdAndUpdate as jest.Mock).mockImplementationOnce(() => {
        throw new Error('DB update fail');
      });
      const result = await service.changeRefundStatus({
        refundId: 'someId',
        refundStatus: RefundStatus.APPROVED,
      });
      expect(result.status).toBe(false);
      expect(result.message).toMatch(/Failed to update refund status/i);
    });
  });
});
*/