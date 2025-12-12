'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Users, Package, ShoppingCart, DollarSign, Plus, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  totalServices: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  totalRevenue: number;
}

interface User {
  _id: string;
  username: string;
  email: string;
  balance: number;
  role: string;
  createdAt: string;
}

interface Service {
  _id: string;
  name: string;
  platform: string;
  type: string;
  price: number;
  isActive: boolean;
  createdAt: string;
}

interface Order {
  _id: string;
  user: {
    username: string;
    email: string;
  };
  service: {
    name: string;
    platform: string;
    type: string;
  };
  link: string;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'services' | 'orders'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState('');

  // Form states
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    platform: 'instagram',
    type: 'followers',
    description: '',
    price: 0,
    minQuantity: 1,
    maxQuantity: 1000,
    apiProvider: '',
    apiServiceId: '',
    isActive: true
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'services') fetchServices();
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch {
      setError('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/services`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setServices(data.data.services);
      }
    } catch {
      setError('Servisler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders);
      }
    } catch {
      setError('Siparişler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingService 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/services/${editingService._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/services`;
      
      const method = editingService ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(serviceForm)
      });

      const data = await response.json();
      
      if (data.success) {
        alert(editingService ? 'Servis güncellendi' : 'Servis oluşturuldu');
        setShowServiceForm(false);
        setEditingService(null);
        setServiceForm({
          name: '',
          platform: 'instagram',
          type: 'followers',
          description: '',
          price: 0,
          minQuantity: 1,
          maxQuantity: 1000,
          apiProvider: '',
          apiServiceId: '',
          isActive: true
        });
        fetchServices();
      } else {
        alert(data.message || 'Hata oluştu');
      }
    } catch {
      alert('Bağlantı hatası');
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      platform: service.platform,
      type: service.type,
      description: service.description || '',
      price: service.price,
      minQuantity: service.minQuantity,
      maxQuantity: service.maxQuantity,
      apiProvider: service.apiProvider || '',
      apiServiceId: service.apiServiceId || '',
      isActive: service.isActive
    });
    setShowServiceForm(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Bu servisi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Servis silindi');
        fetchServices();
      } else {
        alert(data.message || 'Hata oluştu');
      }
    } catch {
      alert('Bağlantı hatası');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen cyber-grid">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="card-dark glow-effect">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold gradient-text mb-4">
                Giriş Yapın
              </h2>
              <p className="text-purple-300 mb-6">
                Admin paneline erişmek için giriş yapmanız gerekiyor
              </p>
              <Link href="/login">
                <Button className="button-primary glow-effect">
                  Giriş Yap
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen cyber-grid">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="card-dark glow-effect">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold gradient-text mb-4">
                Yetkisiz Erişim
              </h2>
              <p className="text-purple-300 mb-6">
                Bu sayfaya erişim yetkiniz bulunmuyor
              </p>
              <Link href="/">
                <Button className="button-primary glow-effect">
                  Ana Sayfaya Dön
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen cyber-grid">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
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
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2 neon-text">
            Admin Dashboard
          </h1>
          <p className="text-purple-200 text-lg">
            Sistem yönetimi ve istatistikler
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-black/20 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Genel Bakış', icon: Eye },
              { id: 'users', label: 'Kullanıcılar', icon: Users },
              { id: 'services', label: 'Servisler', icon: Package },
              { id: 'orders', label: 'Siparişler', icon: ShoppingCart }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as 'overview' | 'users' | 'services' | 'orders')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-purple-500 text-white'
                    : 'text-purple-200 hover:text-white hover:bg-purple-500/20'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="card-dark glow-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm">Toplam Kullanıcı</p>
                      <p className="text-3xl font-bold text-blue-400">{stats.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-dark glow-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm">Toplam Servis</p>
                      <p className="text-3xl font-bold text-green-400">{stats.totalServices}</p>
                    </div>
                    <Package className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-dark glow-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm">Toplam Sipariş</p>
                      <p className="text-3xl font-bold text-yellow-400">{stats.totalOrders}</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-dark glow-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm">Toplam Gelir</p>
                      <p className="text-3xl font-bold text-purple-400">${stats.totalRevenue.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Status Breakdown */}
            <Card className="card-dark glow-effect">
              <CardHeader>
                <CardTitle className="gradient-text">Sipariş Durumları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-yellow-400/10 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">{stats.pendingOrders}</div>
                    <div className="text-sm text-purple-300">Beklemede</div>
                  </div>
                  <div className="text-center p-4 bg-blue-400/10 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{stats.inProgressOrders}</div>
                    <div className="text-sm text-purple-300">İşlemde</div>
                  </div>
                  <div className="text-center p-4 bg-green-400/10 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{stats.completedOrders}</div>
                    <div className="text-sm text-purple-300">Tamamlandı</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold gradient-text">Kullanıcılar</h2>
              <Button onClick={fetchUsers} variant="outline" className="button-secondary">
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenile
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <Card key={user._id} className="card-dark glow-effect">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-white">{user.username}</h3>
                          <p className="text-purple-300 text-sm">{user.email}</p>
                          <p className="text-purple-400 text-xs">
                            Bakiye: ${user.balance.toFixed(2)} • 
                            Rol: {user.role} • 
                            Kayıt: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="button-secondary">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold gradient-text">Servisler</h2>
              <div className="flex space-x-2">
                <Button onClick={fetchServices} variant="outline" className="button-secondary">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yenile
                </Button>
                <Button onClick={() => setShowServiceForm(true)} className="button-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Servis
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <Card key={service._id} className="card-dark glow-effect">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-white">{service.name}</h3>
                          <p className="text-purple-300 text-sm">
                            {service.platform} • {service.type} • ${service.price.toFixed(2)}
                          </p>
                          <p className="text-purple-400 text-xs">
                            Miktar: {service.minQuantity} - {service.maxQuantity.toLocaleString()} • 
                            Durum: {service.isActive ? 'Aktif' : 'Pasif'}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => handleEditService(service)}
                            variant="outline" 
                            size="sm" 
                            className="button-secondary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            onClick={() => handleDeleteService(service._id)}
                            variant="outline" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold gradient-text">Siparişler</h2>
              <Button onClick={fetchOrders} variant="outline" className="button-secondary">
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenile
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order._id} className="card-dark glow-effect">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-white">{order.service.name}</h3>
                          <p className="text-purple-300 text-sm">
                            {order.user.username} ({order.user.email})
                          </p>
                          <p className="text-purple-400 text-xs">
                            {order.service.platform} • {order.service.type} • 
                            Miktar: {order.quantity} • 
                            Fiyat: ${order.totalPrice.toFixed(2)} • 
                            Durum: {order.status}
                          </p>
                          <p className="text-purple-500 text-xs">
                            Link: {order.link}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-purple-300">
                            {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Service Form Modal */}
        {showServiceForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="card-dark glow-effect w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="gradient-text">
                  {editingService ? 'Servis Düzenle' : 'Yeni Servis Ekle'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleServiceSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Servis Adı</Label>
                      <Input
                        id="name"
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="platform">Platform</Label>
                      <select
                        id="platform"
                        value={serviceForm.platform}
                        onChange={(e) => setServiceForm({...serviceForm, platform: e.target.value})}
                        className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-200 focus:outline-none focus:border-purple-500"
                        required
                      >
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                        <option value="twitter">Twitter</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="type">Tür</Label>
                      <select
                        id="type"
                        value={serviceForm.type}
                        onChange={(e) => setServiceForm({...serviceForm, type: e.target.value})}
                        className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-200 focus:outline-none focus:border-purple-500"
                        required
                      >
                        <option value="followers">Takipçi</option>
                        <option value="likes">Beğeni</option>
                        <option value="views">Görüntüleme</option>
                        <option value="comments">Yorum</option>
                        <option value="shares">Paylaşım</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="price">Fiyat ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({...serviceForm, price: parseFloat(e.target.value)})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="minQuantity">Min Miktar</Label>
                      <Input
                        id="minQuantity"
                        type="number"
                        min="1"
                        value={serviceForm.minQuantity}
                        onChange={(e) => setServiceForm({...serviceForm, minQuantity: parseInt(e.target.value)})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxQuantity">Max Miktar</Label>
                      <Input
                        id="maxQuantity"
                        type="number"
                        min="1"
                        value={serviceForm.maxQuantity}
                        onChange={(e) => setServiceForm({...serviceForm, maxQuantity: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Açıklama</Label>
                    <textarea
                      id="description"
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                      className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-200 focus:outline-none focus:border-purple-500"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="apiProvider">API Sağlayıcı</Label>
                      <Input
                        id="apiProvider"
                        value={serviceForm.apiProvider}
                        onChange={(e) => setServiceForm({...serviceForm, apiProvider: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="apiServiceId">API Servis ID</Label>
                      <Input
                        id="apiServiceId"
                        value={serviceForm.apiServiceId}
                        onChange={(e) => setServiceForm({...serviceForm, apiServiceId: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={serviceForm.isActive}
                      onChange={(e) => setServiceForm({...serviceForm, isActive: e.target.checked})}
                      className="rounded border-purple-500/30"
                    />
                    <Label htmlFor="isActive">Aktif</Label>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowServiceForm(false);
                        setEditingService(null);
                        setServiceForm({
                          name: '',
                          platform: 'instagram',
                          type: 'followers',
                          description: '',
                          price: 0,
                          minQuantity: 1,
                          maxQuantity: 1000,
                          apiProvider: '',
                          apiServiceId: '',
                          isActive: true
                        });
                      }}
                      className="flex-1 button-secondary"
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 button-primary glow-effect"
                    >
                      {editingService ? 'Güncelle' : 'Oluştur'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
