import express from 'express';
import { 
  getServices,
  getBalance, 
  createOrder, 
  getOrderStatus,
  getMultipleOrdersStatus,
  cancelOrder,
  createRefill,
  getRefillStatus
} from '../controllers/followizController';
import { adminAuth } from '../middleware/auth';

const router = express.Router();

// Admin only routes
router.use('/balance', adminAuth);

// Get services from Followiz API (Public) - root path
router.get('/', getServices);
router.get('/services', getServices);

// Get balance from Followiz API (Admin only)
router.get('/balance', getBalance);

// Order management routes
router.post('/orders', createOrder);
router.get('/orders/:orderId', getOrderStatus);
router.post('/orders/status', getMultipleOrdersStatus);
router.delete('/orders/:orderId', cancelOrder);
router.post('/orders/cancel', cancelOrder);

// Refill management routes
router.post('/orders/:orderId/refill', createRefill);
router.post('/orders/refill', createRefill);
router.get('/refills/:refillId', getRefillStatus);
router.post('/refills/status', getRefillStatus);

export default router;

