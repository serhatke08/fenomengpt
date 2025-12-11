import express from 'express';
import { body } from 'express-validator';
import { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  cancelOrder,
  updateOrderStatus
} from '../controllers/firebaseOrderController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('serviceId')
    .notEmpty()
    .withMessage('Service ID is required'),
  body('link')
    .isURL()
    .withMessage('Please provide a valid URL'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
];

// All routes require authentication
router.use(auth);

// Routes
router.post('/', createOrderValidation, createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.put('/:orderId/status', updateOrderStatus);

export default router;
