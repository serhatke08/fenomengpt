'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Instagram, Music, Users, Heart, Eye, MessageCircle, Share2, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface Order {
  _id: string;
  service: {
    _id: string;
    name: string;
    platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter';
    type: 'followers' | 'likes' | 'views' | 'comments' | 'shares';
  };
  link: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  startCount?: number;
  currentCount?: number;
  completionDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const platformIcons = {
  instagram: Instagram,
  tiktok: Music,
  youtube: Users,
  twitter: MessageCircle
};

const typeIcons = {
  followers: Users,
  likes: Heart,
  views: Eye,
  comments: MessageCircle,
  shares: Share2
};

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    text: 'Beklemede',
    description: 'Siparişiniz işleme alınmayı bekliyor'
  },
  in_progress: {
    icon: RefreshCw,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    text: 'İşlemde',
    description: 'Siparişiniz aktif olarak işleniyor'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    text: 'Tamamlandı',
    description: 'Siparişiniz başarıyla tamamlandı'
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    text: 'İptal Edildi',
    description: 'Siparişiniz iptal edildi'
  },
  refunded: {
    icon: AlertCircle,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    text: 'İade Edildi',
    description: 'Siparişiniz için iade yapıldı'
  }
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // data.data'nın array olduğundan emin ol
        setOrders(Array.isArray(data.data) ? data.data : []);
      } else {
        setError('Siparişler yüklenirken hata oluştu');
        setOrders([]); // Hata durumunda boş array
      }
    } catch (err) {
      console.error('Siparişler yükleme hatası:', err);
      setError('Siparişler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Sipariş iptal edildi');
        fetchOrders(); // Refresh orders
      } else {
        alert(data.message || 'Sipariş iptal edilirken hata oluştu');
      }
    } catch (err) {
      console.error('Sipariş iptal hatası:', err);
      alert('Sipariş iptal edilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  ) : [];

  const getProgressPercentage = (order: Order) => {
    if (!order.startCount || !order.currentCount) return 0;
    const progress = ((order.currentCount - order.startCount) / order.quantity) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (!user) {
    return (
      <div className="min-h-screen cyber-grid">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pb-16">
          <Card className="card-dark glow-effect">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold gradient-text mb-4">
                Giriş Yapın
              </h2>
              <p className="text-purple-300 mb-6">
                Siparişlerinizi görüntülemek için giriş yapmanız gerekiyor
              </p>
              <div className="flex space-x-4 justify-center">
                <Link href="/login">
                  <Button className="button-primary glow-effect">
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="button-secondary">
                    Kaydol
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen cyber-grid">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pb-16">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 glow-effect"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2 neon-text">
            Siparişlerim
          </h1>
          <p className="text-purple-200 text-lg">
            Tüm siparişlerinizi takip edin ve yönetin
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="card-dark glow-effect">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">{orders.length}</div>
              <div className="text-sm text-purple-300">Toplam Sipariş</div>
            </CardContent>
          </Card>
          <Card className="card-dark glow-effect">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <div className="text-sm text-purple-300">Beklemede</div>
            </CardContent>
          </Card>
          <Card className="card-dark glow-effect">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">
                {orders.filter(o => o.status === 'in_progress').length}
              </div>
              <div className="text-sm text-purple-300">İşlemde</div>
            </CardContent>
          </Card>
          <Card className="card-dark glow-effect">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">
                {orders.filter(o => o.status === 'completed').length}
              </div>
              <div className="text-sm text-purple-300">Tamamlandı</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <Card className="card-dark glow-effect">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <span className="text-purple-200">Durum:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">Tümü</option>
                  <option value="pending">Beklemede</option>
                  <option value="in_progress">İşlemde</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal Edildi</option>
                  <option value="refunded">İade Edildi</option>
                </select>
                <Button
                  onClick={fetchOrders}
                  variant="outline"
                  className="button-secondary"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yenile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        {error ? (
          <Card className="card-dark glow-effect">
            <CardContent className="p-8 text-center">
              <p className="text-red-400 text-lg">{error}</p>
              <Button onClick={fetchOrders} className="mt-4 button-primary">
                Tekrar Dene
              </Button>
            </CardContent>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card className="card-dark glow-effect">
            <CardContent className="p-8 text-center">
              <p className="text-purple-300 text-lg mb-4">
                {statusFilter === 'all' ? 'Henüz siparişiniz yok' : 'Bu durumda sipariş bulunamadı'}
              </p>
              <Link href="/services">
                <Button className="button-primary glow-effect">
                  Servisleri Görüntüle
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const PlatformIcon = platformIcons[order.service.platform];
              const TypeIcon = typeIcons[order.service.type];
              const StatusIcon = statusConfig[order.status].icon;
              const statusConfig_data = statusConfig[order.status];
              const progress = getProgressPercentage(order);

              return (
                <Card key={order._id} className="card-dark glow-effect">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                      {/* Service Info */}
                      <div className="flex items-start space-x-4">
                        <div className="flex items-center space-x-2">
                          <PlatformIcon className="h-5 w-5 text-purple-400" />
                          <TypeIcon className="h-5 w-5 text-pink-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold gradient-text">
                            {order.service.name}
                          </h3>
                          <p className="text-purple-300 text-sm">
                            {order.service.platform} • {order.service.type}
                          </p>
                          <p className="text-purple-400 text-xs mt-1">
                            Link: {order.link}
                          </p>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="flex flex-col md:items-end space-y-2">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`h-5 w-5 ${statusConfig_data.color}`} />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig_data.bgColor} ${statusConfig_data.color}`}>
                            {statusConfig_data.text}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">
                            ${order.totalPrice.toFixed(2)}
                          </div>
                          <div className="text-sm text-purple-300">
                            {order.quantity.toLocaleString()} adet
                          </div>
                        </div>

                        {/* Progress Bar for in_progress orders */}
                        {order.status === 'in_progress' && order.startCount !== undefined && order.currentCount !== undefined && (
                          <div className="w-full md:w-48">
                            <div className="flex justify-between text-xs text-purple-300 mb-1">
                              <span>İlerleme</span>
                              <span>{progress.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-purple-900/30 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-purple-400 mt-1">
                              <span>Başlangıç: {order.startCount.toLocaleString()}</span>
                              <span>Şu an: {order.currentCount.toLocaleString()}</span>
                            </div>
                          </div>
                        )}

                        {/* Completion Date */}
                        {order.completionDate && (
                          <div className="text-xs text-green-400">
                            Tamamlandı: {new Date(order.completionDate).toLocaleDateString('tr-TR')}
                          </div>
                        )}

                        {/* Created Date */}
                        <div className="text-xs text-purple-400">
                          Oluşturuldu: {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="mt-4 p-3 bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-purple-300">
                          <strong>Not:</strong> {order.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end mt-4 space-x-2">
                      {order.status === 'pending' && (
                        <Button
                          onClick={() => handleCancelOrder(order._id)}
                          variant="outline"
                          className="button-secondary text-red-400 hover:text-red-300"
                        >
                          İptal Et
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
