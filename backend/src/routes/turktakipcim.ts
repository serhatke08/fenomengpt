import express from 'express';
import { 
  getServices,
  getBalance, 
  createOrder, 
  getOrderStatus,
  getMultipleOrdersStatus,
  cancelOrder
} from '../controllers/turktakipcimController';
import { adminAuth } from '../middleware/auth';

const router = express.Router();

// Admin only routes
router.use('/balance', adminAuth);

// Get services from TurkTakipcim API (Public) - root path
router.get('/', getServices);
router.get('/services', getServices);

// Get balance from TurkTakipcim API (Admin only)
router.get('/balance', getBalance);

// Order management routes
router.post('/orders', createOrder);
router.get('/orders/:orderId', getOrderStatus);
router.post('/orders/status', getMultipleOrdersStatus);
router.delete('/orders/:orderId', cancelOrder);
router.post('/orders/cancel', cancelOrder);

export default router;

