import { Request, Response } from 'express';
import TurkTakipcimService from '../services/turktakipcimService';

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    // API key kontrolü
    const apiKey = process.env.TURKTAKIPCIM_API_KEY;
    if (!apiKey || apiKey === 'your_turktakipcim_api_key_here' || apiKey === 'your_turktakipcim_api_key') {
      // API key yoksa boş liste döndür (frontend'de hata göstermek yerine)
      console.warn('TURKTAKIPCIM_API_KEY is not configured. Returning empty services list.');
      res.json({
        success: true,
        data: [],
        count: 0,
        message: 'API key is not configured. Services will be available after adding TURKTAKIPCIM_API_KEY to .env file.'
      });
      return;
    }

    const turktakipcimService = new TurkTakipcimService();
    const services = await turktakipcimService.getServices();
    
    // Tüm servisleri döndür - hiçbir filtreleme yapma
    const validServices = Array.isArray(services) 
      ? services.filter(service => service != null)
      : [];
    
    console.log(`Fetched ${validServices.length} services from TurkTakipcim API (total: ${services?.length || 0})`);
    
    res.json({
      success: true,
      data: validServices,
      count: validServices.length
    });
  } catch (error) {
    console.error('Error fetching TurkTakipcim services:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Hata durumunda da boş liste döndür (kullanıcı deneyimini bozmamak için)
    res.json({
      success: true,
      data: [],
      count: 0,
      message: 'Failed to fetch services from TurkTakipcim API',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};

export const getBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const turktakipcimService = new TurkTakipcimService();
    const balance = await turktakipcimService.getBalance();

    res.status(200).json({
      success: true,
      data: balance
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get balance from TurkTakipcim API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceId, link, quantity, runs, interval } = req.body;

    if (!serviceId || !link || !quantity) {
      res.status(400).json({
        success: false,
        message: 'serviceId, link, and quantity are required'
      });
      return;
    }

    const turktakipcimService = new TurkTakipcimService();
    const order = await turktakipcimService.createOrder(
      serviceId, 
      link, 
      quantity,
      runs,
      interval
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order with TurkTakipcim API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      res.status(400).json({
        success: false,
        message: 'orderId is required'
      });
      return;
    }

    const turktakipcimService = new TurkTakipcimService();
    const order = await turktakipcimService.getOrderStatus(parseInt(orderId));

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order status from TurkTakipcim API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getMultipleOrdersStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'orderIds array is required'
      });
      return;
    }

    if (orderIds.length > 100) {
      res.status(400).json({
        success: false,
        message: 'Maximum 100 order IDs allowed'
      });
      return;
    }

    const turktakipcimService = new TurkTakipcimService();
    const orders = await turktakipcimService.getMultipleOrdersStatus(orderIds);

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get multiple orders status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get multiple orders status from TurkTakipcim API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { orderIds } = req.body;

    const turktakipcimService = new TurkTakipcimService();
    let result;

    // Eğer body'de orderIds varsa, multiple cancel
    if (orderIds && Array.isArray(orderIds)) {
      if (orderIds.length > 100) {
        res.status(400).json({
          success: false,
          message: 'Maximum 100 order IDs allowed'
        });
        return;
      }
      result = await turktakipcimService.cancelOrder(orderIds);
    } else if (orderId) {
      // Single order cancel
      result = await turktakipcimService.cancelOrder([parseInt(orderId)]);
    } else {
      res.status(400).json({
        success: false,
        message: 'orderId or orderIds is required'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order with TurkTakipcim API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

