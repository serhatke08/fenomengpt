import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Order } from '../models/supabase/Order';
import { User } from '../models/supabase/User';
import TurkTakipcimService from '../services/turktakipcimService';

interface AuthRequest extends Request {
  userId?: string;
}

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { serviceId, link, quantity } = req.body;

    // TurkTakipcim API'den servis bilgilerini çek
    const turktakipcimService = new TurkTakipcimService();
    let serviceInfo;
    try {
      const services = await turktakipcimService.getServices();
      serviceInfo = services.find(s => s.service === parseInt(serviceId));
      
      if (!serviceInfo) {
        res.status(404).json({
          success: false,
          message: 'Service not found'
        });
        return;
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch service information'
      });
      return;
    }

    // Miktar kontrolü
    const minQuantity = parseInt(serviceInfo.min);
    const maxQuantity = parseInt(serviceInfo.max);
    
    if (quantity < minQuantity || quantity > maxQuantity) {
      res.status(400).json({
        success: false,
        message: `Quantity must be between ${minQuantity} and ${maxQuantity}`
      });
      return;
    }

    // Toplam fiyat hesapla (rate string olarak geliyor, 1000 birim için, %52 zam uygulanıyor)
    const rate = parseFloat(serviceInfo.rate);
    const increasedRate = rate * 1.52; // %52 zam
    const totalPrice = (increasedRate * quantity) / 1000;

    // Kullanıcı kontrolü ve bakiye kontrolü
    const user = await User.findById(req.userId!);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (user.balance < totalPrice) {
      res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
      return;
    }

    // TurkTakipcim API ile sipariş oluştur
    let externalOrderId: string | null = null;
    let orderStatus = 'pending';

    try {
      const externalOrder = await turktakipcimService.createOrder(
        serviceInfo.service,
        link,
        quantity
      );
      
      externalOrderId = externalOrder.order.toString();
      orderStatus = 'in_progress'; // TurkTakipcim'de sipariş oluşturulduğunda otomatik olarak işleme alınır
    } catch (error) {
      console.error('TurkTakipcim API error:', error);
      // TurkTakipcim API hatası durumunda siparişi pending olarak oluştur
      orderStatus = 'pending';
    }

    // Sipariş oluştur
    const order = await Order.create({
      user_id: req.userId!,
      service_id: serviceId,
      link,
      quantity,
      total_price: totalPrice,
      status: orderStatus as 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'refunded',
      api_order_id: externalOrderId || undefined
    });

    // Kullanıcı bakiyesini güncelle
    await User.update(req.userId!, { balance: user.balance - totalPrice });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { 
        order,
        externalOrderId: externalOrderId
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { orders, total } = await Order.findByUserId(req.userId!, limit, offset);

    // Servis bilgilerini TurkTakipcim API'den çek
    const turktakipcimService = new TurkTakipcimService();
    let allServices: Awaited<ReturnType<typeof turktakipcimService.getServices>> = [];
    try {
      allServices = await turktakipcimService.getServices();
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }

    const ordersWithServices = await Promise.all(
      orders.map(async (order) => {
        const service = allServices.find(s => s.service === parseInt(order.service_id));
        return {
          ...order,
          service: service ? {
            service: service.service,
            name: service.name,
            category: service.category,
            type: service.type
          } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        orders: ordersWithServices,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Kullanıcı kontrolü (sadece kendi siparişini görebilir)
    if (order.user_id !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    // Servis bilgisini TurkTakipcim API'den çek
    const turktakipcimService = new TurkTakipcimService();
    let service = null;
    try {
      const services = await turktakipcimService.getServices();
      service = services.find(s => s.service === parseInt(order.service_id));
    } catch (error) {
      console.error('Failed to fetch service:', error);
    }

    res.status(200).json({
      success: true,
      data: {
        ...order,
        service: service ? {
          service: service.service,
          name: service.name,
          category: service.category,
          type: service.type
        } : null
      }
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Kullanıcı kontrolü
    if (order.user_id !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    // Sadece beklemedeki ve işlemdeki siparişler iptal edilebilir
    if (!['pending', 'in_progress'].includes(order.status)) {
      res.status(400).json({
        success: false,
        message: 'Only pending or in-progress orders can be cancelled'
      });
      return;
    }

    // TurkTakipcim API'den siparişi iptal et (eğer external order ID varsa)
    if (order.api_order_id) {
      try {
        const turktakipcimService = new TurkTakipcimService();
        await turktakipcimService.cancelOrder([parseInt(order.api_order_id)]);
      } catch (error) {
        console.error('TurkTakipcim cancel order error:', error);
        // API hatası olsa bile yerel siparişi iptal et
      }
    }

    // Siparişi iptal et
    await Order.update(id, { status: 'cancelled' });

    // Kullanıcı bakiyesini geri yükle
    const user = await User.findById(req.userId!);
    if (user) {
      await User.update(req.userId!, { balance: user.balance + order.total_price });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order || !order.api_order_id) {
      res.status(404).json({
        success: false,
        message: 'Order not found or no external order ID'
      });
      return;
    }

    // TurkTakipcim API'den sipariş durumunu kontrol et
    const turktakipcimService = new TurkTakipcimService();
    const externalOrder = await turktakipcimService.getOrderStatus(parseInt(order.api_order_id));

    // Durumu güncelle
    let newStatus = order.status;
    let currentCount = order.current_count || 0;
    let completionDate = order.completion_date;

    switch (externalOrder.status) {
      case 'Completed':
        newStatus = 'completed';
        currentCount = parseInt(externalOrder.start_count) + (parseInt(externalOrder.start_count) - parseInt(externalOrder.remains));
        completionDate = new Date().toISOString();
        break;
      case 'In progress':
      case 'Partial':
        newStatus = 'in_progress';
        currentCount = parseInt(externalOrder.start_count) + (parseInt(externalOrder.start_count) - parseInt(externalOrder.remains));
        break;
      case 'Canceled':
        newStatus = 'cancelled';
        break;
    }

    // Siparişi güncelle
    await Order.update(orderId, {
      status: newStatus,
      current_count: currentCount,
      completion_date: completionDate ? new Date(completionDate).toISOString() : undefined
    });

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId,
        status: newStatus,
        currentCount,
        completionDate
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
