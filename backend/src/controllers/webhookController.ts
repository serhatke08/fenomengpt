import { Request, Response } from 'express';
import { Order } from '../models/supabase/Order';

export const followizWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order, status, remains, charge } = req.body;

    if (!order || !status) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: order and status'
      });
      return;
    }

    // Find order by external order ID
    const orders = await Order.findAll(1000, 0);
    const localOrder = orders.orders.find(o => o.api_order_id === order.toString());

    if (!localOrder) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Update order status based on Followiz status
    let newStatus = localOrder.status;
    let currentCount = localOrder.current_count || 0;
    let completionDate = localOrder.completion_date;

    switch (status) {
      case 'Completed':
        newStatus = 'completed';
        currentCount = localOrder.quantity;
        completionDate = new Date().toISOString();
        break;
      case 'In progress':
        newStatus = 'in_progress';
        currentCount = localOrder.quantity - (remains || 0);
        break;
      case 'Canceled':
        newStatus = 'cancelled';
        break;
      case 'Partial':
        newStatus = 'in_progress';
        currentCount = localOrder.quantity - (remains || 0);
        break;
    }

    // Update the order
    await Order.update(localOrder.id!, {
      status: newStatus,
      current_count: currentCount,
      completion_date: completionDate ? new Date(completionDate).toISOString() : undefined
    });

    console.log(`Order ${localOrder.id} updated: ${localOrder.status} -> ${newStatus}`);

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
