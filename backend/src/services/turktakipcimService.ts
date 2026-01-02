import axios, { AxiosResponse } from 'axios';

export interface TurkTakipcimService {
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

export interface TurkTakipcimOrder {
  order: number;
}

export interface TurkTakipcimOrderStatus {
  charge: string;
  start_count: string;
  status: string;
  remains: string;
  currency: string;
}

export interface TurkTakipcimBalance {
  balance: string;
  currency: string;
}

export class TurkTakipcimService {
  private apiKey: string;
  private baseUrl: string = 'https://www.turktakipcim.com/api/v2';

  constructor() {
    this.apiKey = process.env.TURKTAKIPCIM_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('TURKTAKIPCIM_API_KEY is required');
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

      // API hata kontrolü
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        if ('error' in response.data) {
          const errorMsg = (response.data as any).error;
          throw new Error(`API Error: ${errorMsg}`);
        }
      }

      return response.data as T;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(`API Error: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
          throw new Error('API Error: No response received from server');
        }
      }
      throw error;
    }
  }

  /**
   * Tüm servisleri getir
   */
  async getServices(): Promise<TurkTakipcimService[]> {
    return this.makeRequest<TurkTakipcimService[]>({
      action: 'services'
    });
  }

  /**
   * Bakiye sorgula
   */
  async getBalance(): Promise<TurkTakipcimBalance> {
    return this.makeRequest<TurkTakipcimBalance>({
      action: 'balance'
    });
  }

  /**
   * Sipariş oluştur
   */
  async createOrder(
    serviceId: number,
    link: string,
    quantity: number,
    runs?: number,
    interval?: number
  ): Promise<TurkTakipcimOrder> {
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

    return this.makeRequest<TurkTakipcimOrder>(data);
  }

  /**
   * Sipariş durumunu sorgula
   */
  async getOrderStatus(orderId: number): Promise<TurkTakipcimOrderStatus> {
    return this.makeRequest<TurkTakipcimOrderStatus>({
      action: 'status',
      order: orderId
    });
  }

  /**
   * Çoklu sipariş durumunu sorgula
   */
  async getMultipleOrdersStatus(orderIds: number[]): Promise<{ [orderId: string]: TurkTakipcimOrderStatus }> {
    const data: any = {
      action: 'status'
    };

    // Her order ID'yi ayrı parametre olarak ekle
    orderIds.forEach((id, index) => {
      data[`orders[${index}]`] = id;
    });

    return this.makeRequest<{ [orderId: string]: TurkTakipcimOrderStatus }>(data);
  }

  /**
   * Siparişi iptal et
   */
  async cancelOrder(orderIds: number[]): Promise<any> {
    const data: any = {
      action: 'cancel'
    };

    // Her order ID'yi ayrı parametre olarak ekle
    orderIds.forEach((id, index) => {
      data[`orders[${index}]`] = id;
    });

    return this.makeRequest<any>(data);
  }
}

export default TurkTakipcimService;

