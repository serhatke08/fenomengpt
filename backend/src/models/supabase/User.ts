import supabaseAdmin from '../../config/supabase';

export interface IUser {
  id?: string;
  username: string;
  email: string;
  password?: string;
  balance: number;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class User {
  static async create(userData: Omit<IUser, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<IUser> {
    try {
      const now = new Date().toISOString();
      const userDataWithDefaults = {
        ...userData,
        balance: userData.balance || 0,
        role: userData.role || 'user',
        is_active: userData.is_active !== undefined ? userData.is_active : true,
      };
      
      const user: Partial<IUser> = {
        ...userDataWithDefaults,
        created_at: now,
        updated_at: now,
      };

      // Eğer id verilmişse, onu kullan
      if (userData.id) {
        user.id = userData.id;
      }

      const { data, error } = await supabaseAdmin
        .from('users')
        .insert(user)
        .select()
        .single();

      if (error) {
        console.error('Supabase error in create:', error);
        throw new Error(`Failed to create user: ${error.message}`);
      }

      return data as IUser;
    } catch (error: any) {
      if (error.message && error.message.includes('fetch failed')) {
        console.error('Network error in create:', error);
        throw new Error('Database connection failed. Please check your Supabase configuration.');
      }
      throw error;
    }
  }

  static async findById(id: string): Promise<IUser | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return data as IUser;
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Supabase error in findByEmail:', error);
        throw new Error(`Failed to find user by email: ${error.message}`);
      }

      return data as IUser;
    } catch (error: any) {
      if (error.message && error.message.includes('fetch failed')) {
        console.error('Network error in findByEmail:', error);
        throw new Error('Database connection failed. Please check your Supabase configuration.');
      }
      throw error;
    }
  }

  static async findByUsername(username: string): Promise<IUser | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('username', username)
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Supabase error in findByUsername:', error);
        throw new Error(`Failed to find user by username: ${error.message}`);
      }

      return data as IUser;
    } catch (error: any) {
      if (error.message && error.message.includes('fetch failed')) {
        console.error('Network error in findByUsername:', error);
        throw new Error('Database connection failed. Please check your Supabase configuration.');
      }
      throw error;
    }
  }

  static async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    // password'ü updateData'dan çıkar (ayrı bir fonksiyonla güncellenmeli)
    const { password, ...updateDataWithoutPassword } = updateData;

    const { data: updatedData, error } = await supabaseAdmin
      .from('users')
      .update(updateDataWithoutPassword)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return updatedData as IUser;
  }

  static async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }
  }

  static async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      return false;
    }

    return true;
  }

  static async findAll(limit: number = 10, offset: number = 0): Promise<{ users: IUser[], total: number }> {
    const { data, error, count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to find users: ${error.message}`);
    }

    return {
      users: (data || []) as IUser[],
      total: count || 0
    };
  }

  static async countDocuments(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Failed to count users: ${error.message}`);
    }

    return count || 0;
  }
}

