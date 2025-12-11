import express from 'express';
import { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  getOrders,
  updateOrder,
  getStats
} from '../controllers/firebaseAdminController';
import { adminAuth } from '../middleware/auth';

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Order management
router.get('/orders', getOrders);
router.put('/orders/:id', updateOrder);

// Statistics
router.get('/stats', getStats);

export default router;
