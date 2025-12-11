import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/supabase/User';
import { Order } from '../models/supabase/Order';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { users, total } = await User.findAll(limit, offset);

    res.status(200).json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          balance: user.balance,
          role: user.role,
          isActive: user.is_active,
          createdAt: user.created_at
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, email, balance, role, isActive } = req.body;

    const updatedUser = await User.update(id, {
      username,
      email,
      balance,
      role,
      is_active: isActive
    });

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        balance: updatedUser.balance,
        role: updatedUser.role,
        isActive: updatedUser.is_active
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const success = await User.delete(id);
    if (!success) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { orders, total } = await Order.findAll(limit, offset);

    // Kullanıcı bilgilerini ekle
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const user = await User.findById(order.user_id);
        
        return {
          ...order,
          user: user ? {
            id: user.id,
            username: user.username,
            email: user.email
          } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        orders: ordersWithDetails,
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
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;

    const order = await Order.update(id, updateData);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Kullanıcı bilgilerini ekle
    const user = await User.findById(order.user_id);

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: {
        ...order,
        user: user ? {
          id: user.id,
          username: user.username,
          email: user.email
        } : null
      }
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const completedOrders = await Order.countByStatus('completed');
    const pendingOrders = await Order.countByStatus('pending');
    const inProgressOrders = await Order.countByStatus('in_progress');
    
    const totalRevenue = await Order.getTotalRevenue();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        completedOrders,
        pendingOrders,
        inProgressOrders,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
