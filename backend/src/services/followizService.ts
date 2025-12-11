import axios, { AxiosResponse } from 'axios';

export interface FollowizService {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  refill: boolean;
  cancel: boolean;
}

export interface FollowizOrder {
  order: number;
  error?: string;
}

export interface FollowizOrderStatus {
  charge: string;
  start_count: string;
  status: string;
  remains: string;
  currency: string;
  error?: string;
}

export interface FollowizMultipleOrderStatus {
  [orderId: string]: FollowizOrderStatus;
}

export interface FollowizBalance {
  balance: string;
  currency: string;
}

export interface FollowizRefillResponse {
  refill: number | { error: string };
}

export interface FollowizRefillStatus {
  status: string;
}

export interface FollowizCancelResponse {
  cancel: number | { error: string };
}

export class FollowizService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.FOLLOWIZ_API_KEY || '';
    this.baseUrl = 'https://followiz.com/api/v2';
    
    if (!this.apiKey) {
      throw new Error('FOLLOWIZ_API_KEY is required');
    }
  }

  private async makeRequest<T>(data: any): Promise<T> {
    try {
      // Form-urlencoded format için URLSearchParams kullan
      const params = new URLSearchParams();
      params.append('key', this.apiKey);
      Object.keys(data).forEach(key => {
        params.append(key, String(data[key]));
      });

      const response: AxiosResponse<T> = await axios.post(
        this.baseUrl,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 30000
        }
      );

      // Followiz API hata kontrolü
      // Eğer response bir object ise ve error içeriyorsa
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        if ('error' in response.data) {
          const errorMsg = (response.data as any).error;
          throw new Error(`API Error: ${errorMsg}`);
        }
      }

      // Array ise direkt döndür (servisler listesi)
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(`API Error: ${error.response.status} - ${error.response.data?.error || error.message}`);
        } else if (error.request) {
          throw new Error('API Error: No response received from server');
        }
      }
      throw error;
    }
  }

  /**
   * Get all available services
   */
  async getServices(): Promise<FollowizService[]> {
    return this.makeRequest<FollowizService[]>({
      action: 'services'
    });
  }

  /**
   * Get user balance
   */
  async getBalance(): Promise<FollowizBalance> {
    return this.makeRequest<FollowizBalance>({
      action: 'balance'
    });
  }

  /**
   * Create a new order
   */
  async createOrder(
    serviceId: number, 
    link: string, 
    quantity: number,
    runs?: number,
    interval?: number
  ): Promise<FollowizOrder> {
    const data: any = {
      action: 'add',
      service: serviceId,
      link,
      quantity
    };

    if (runs !== undefined) {
      data.runs = runs;
    }

    if (interval !== undefined) {
      data.interval = interval;
    }

    return this.makeRequest<FollowizOrder>(data);
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: number): Promise<FollowizOrderStatus> {
    return this.makeRequest<FollowizOrderStatus>({
      action: 'status',
      order: orderId
    });
  }

  /**
   * Get multiple orders status
   */
  async getMultipleOrdersStatus(orderIds: number[]): Promise<FollowizMultipleOrderStatus> {
    return this.makeRequest<FollowizMultipleOrderStatus>({
      action: 'status',
      orders: orderIds.join(',')
    });
  }

  /**
   * Create refill for an order
   */
  async createRefill(orderId: number): Promise<FollowizRefillResponse> {
    return this.makeRequest<FollowizRefillResponse>({
      action: 'refill',
      order: orderId
    });
  }

  /**
   * Create multiple refills
   */
  async createMultipleRefills(orderIds: number[]): Promise<Array<{ order: number; refill: number | { error: string } }>> {
    return this.makeRequest<Array<{ order: number; refill: number | { error: string } }>>({
      action: 'refill',
      orders: orderIds.join(',')
    });
  }

  /**
   * Get refill status
   */
  async getRefillStatus(refillId: number): Promise<FollowizRefillStatus> {
    return this.makeRequest<FollowizRefillStatus>({
      action: 'refill_status',
      refill: refillId
    });
  }

  /**
   * Get multiple refill statuses
   */
  async getMultipleRefillStatuses(refillIds: number[]): Promise<Array<{ refill: number; status: string | { error: string } }>> {
    return this.makeRequest<Array<{ refill: number; status: string | { error: string } }>>({
      action: 'refill_status',
      refills: refillIds.join(',')
    });
  }

  /**
   * Cancel an order or multiple orders
   */
  async cancelOrder(orderIds: number[]): Promise<Array<{ order: number; cancel: number | { error: string } }>> {
    return this.makeRequest<Array<{ order: number; cancel: number | { error: string } }>>({
      action: 'cancel',
      orders: orderIds.join(',')
    });
  }
}

export default FollowizService;

