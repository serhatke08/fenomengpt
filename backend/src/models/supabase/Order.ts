import supabaseAdmin from '../../config/supabase';

export interface IOrder {
  id?: string;
  user_id: string;
  service_id: string;
  link: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  api_order_id?: string;
  start_count?: number;
  current_count?: number;
  completion_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class Order {
  static async create(orderData: Omit<IOrder, 'id' | 'created_at' | 'updated_at'>): Promise<IOrder> {
    const now = new Date().toISOString();
    const order: Partial<IOrder> = {
      ...orderData,
      status: orderData.status || 'pending',
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }

    return data as IOrder;
  }

  static async findById(id: string): Promise<IOrder | null> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to find order: ${error.message}`);
    }

    return data as IOrder;
  }

  static async findByUserId(userId: string, limit: number = 10, offset: number = 0): Promise<{ orders: IOrder[], total: number }> {
    const { data, error, count } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to find orders: ${error.message}`);
    }

    return {
      orders: (data || []) as IOrder[],
      total: count || 0
    };
  }

  static async findAll(limit: number = 10, offset: number = 0): Promise<{ orders: IOrder[], total: number }> {
    const { data, error, count } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to find orders: ${error.message}`);
    }

    return {
      orders: (data || []) as IOrder[],
      total: count || 0
    };
  }

  static async findByStatus(status: string): Promise<IOrder[]> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find orders: ${error.message}`);
    }

    return (data || []) as IOrder[];
  }

  static async update(id: string, data: Partial<IOrder>): Promise<IOrder | null> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedData, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update order: ${error.message}`);
    }

    return updatedData as IOrder;
  }

  static async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      return false;
    }

    return true;
  }

  static async countDocuments(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Failed to count orders: ${error.message}`);
    }

    return count || 0;
  }

  static async countByStatus(status: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);

    if (error) {
      throw new Error(`Failed to count orders: ${error.message}`);
    }

    return count || 0;
  }

  static async getTotalRevenue(): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('total_price')
      .eq('status', 'completed');

    if (error) {
      throw new Error(`Failed to get revenue: ${error.message}`);
    }

    let total = 0;
    (data || []).forEach((order: any) => {
      total += order.total_price || 0;
    });

    return total;
  }
}

