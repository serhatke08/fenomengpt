import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import supabaseAdmin from '../config/supabase';
import { User } from '../models/supabase/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: errors.array()[0].msg || 'Validation failed'
      });
      return;
    }

    const { username, email, password } = req.body;

    // Veritabanında email kontrolü
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
      return;
    }

    // Veritabanında username kontrolü
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
      return;
    }

    // Supabase Auth'da kullanıcı oluştur
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username }
    });

    if (authError || !authData.user) {
      console.error('Auth error:', authError);
      res.status(400).json({
        success: false,
        message: authError?.message || 'Failed to create user account'
      });
      return;
    }

    // Veritabanına kullanıcı kaydet
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const user = await User.create({
        id: authData.user.id,
        username,
        email,
        password: hashedPassword,
        balance: 0,
        role: 'user',
        is_active: true
      });

      // JWT token oluştur
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            balance: user.balance,
            role: user.role
          },
          token
        }
      });
    } catch (dbError: any) {
      // Veritabanı hatası - Supabase Auth'daki kullanıcıyı sil
      console.error('Database error:', dbError);
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      } catch (deleteError) {
        console.error('Failed to delete auth user:', deleteError);
      }

      res.status(400).json({
        success: false,
        message: dbError.message || 'Failed to create user profile'
      });
    }
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: errors.array()[0].msg || 'Validation failed'
      });
      return;
    }

    const { email, password } = req.body;

    // Supabase Auth ile giriş yap
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      res.status(401).json({
        success: false,
        message: authError?.message || 'Invalid email or password'
      });
      return;
    }

    // Veritabanından kullanıcıyı bul
    let user = await User.findById(authData.user.id);

    // Eğer veritabanında yoksa oluştur
    if (!user) {
      try {
        const username = authData.user.user_metadata?.username || 
                        email.split('@')[0] || 
                        `user_${authData.user.id.substring(0, 8)}`;
        
        // Username unique kontrolü
        let finalUsername = username;
        let counter = 1;
        while (await User.findByUsername(finalUsername)) {
          finalUsername = `${username}_${counter}`;
          counter++;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        
        user = await User.create({
          id: authData.user.id,
          username: finalUsername,
          email: authData.user.email || email,
          password: hashedPassword,
          balance: 0,
          role: 'user',
          is_active: true
        });
      } catch (createError: any) {
        console.error('Failed to create user:', createError);
        res.status(500).json({
          success: false,
          message: 'Failed to create user profile'
        });
        return;
      }
    }

    // Hesap aktif kontrolü
    if (!user.is_active) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
      return;
    }

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          balance: user.balance,
          role: user.role
        },
        token
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const user = await User.findById(userId);
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
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const { username, email } = req.body;

    if (email) {
      const existing = await User.findByEmail(email);
      if (existing && existing.id !== userId) {
        res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
        return;
      }
    }

    if (username) {
      const existing = await User.findByUsername(username);
      if (existing && existing.id !== userId) {
        res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
        return;
      }
    }

    const updatedUser = await User.update(userId, { username, email });
    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        balance: updatedUser.balance,
        role: updatedUser.role
      }
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Mevcut şifre kontrolü
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });

    if (signInError) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Yeni şifreyi güncelle
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (updateError) {
      res.status(400).json({
        success: false,
        message: updateError.message || 'Failed to update password'
      });
      return;
    }

    // Veritabanında da güncelle
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.updatePassword(userId, hashedPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};
