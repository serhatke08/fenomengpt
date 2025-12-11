import { Request, Response } from 'express';
import FollowizService from '../services/followizService';

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    // API key kontrolü
    const apiKey = process.env.FOLLOWIZ_API_KEY;
    if (!apiKey || apiKey === 'your_followiz_api_key_here' || apiKey === 'your_followiz_api_key') {
      res.status(500).json({
        success: false,
        message: 'FOLLOWIZ_API_KEY is not configured. Please add your API key to .env file.',
        error: 'API key is missing or placeholder'
      });
      return;
    }

    const followizService = new FollowizService();
    const services = await followizService.getServices();
    
    res.json({
      success: true,
      data: services,
      count: services.length
    });
  } catch (error) {
    console.error('Error fetching Followiz services:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      hint: errorMessage.includes('Invalid API key') ? 'Please check your FOLLOWIZ_API_KEY in .env file' : undefined
    });
  }
};

export const getBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const followizService = new FollowizService();
    const balance = await followizService.getBalance();

    res.status(200).json({
      success: true,
      data: balance
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get balance from Followiz API',
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

    const followizService = new FollowizService();
    const order = await followizService.createOrder(
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
      message: 'Failed to create order with Followiz API',
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

    const followizService = new FollowizService();
    const order = await followizService.getOrderStatus(parseInt(orderId));

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order status from Followiz API',
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

    const followizService = new FollowizService();
    const orders = await followizService.getMultipleOrdersStatus(orderIds);

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get multiple orders status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get multiple orders status from Followiz API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { orderIds } = req.body;

    const followizService = new FollowizService();
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
      result = await followizService.cancelOrder(orderIds);
    } else if (orderId) {
      // Single order cancel
      result = await followizService.cancelOrder([parseInt(orderId)]);
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
      message: 'Failed to cancel order with Followiz API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createRefill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { orderIds } = req.body;

    const followizService = new FollowizService();
    let result;

    // Eğer body'de orderIds varsa, multiple refill
    if (orderIds && Array.isArray(orderIds)) {
      if (orderIds.length > 100) {
        res.status(400).json({
          success: false,
          message: 'Maximum 100 order IDs allowed'
        });
        return;
      }
      result = await followizService.createMultipleRefills(orderIds);
    } else if (orderId) {
      // Single order refill
      result = await followizService.createRefill(parseInt(orderId));
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
    console.error('Create refill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create refill with Followiz API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getRefillStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refillId } = req.params;
    const { refillIds } = req.body;

    const followizService = new FollowizService();
    let result;

    // Eğer body'de refillIds varsa, multiple refill status
    if (refillIds && Array.isArray(refillIds)) {
      if (refillIds.length > 100) {
        res.status(400).json({
          success: false,
          message: 'Maximum 100 refill IDs allowed'
        });
        return;
      }
      result = await followizService.getMultipleRefillStatuses(refillIds);
    } else if (refillId) {
      // Single refill status
      result = await followizService.getRefillStatus(parseInt(refillId));
    } else {
      res.status(400).json({
        success: false,
        message: 'refillId or refillIds is required'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get refill status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get refill status from Followiz API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

