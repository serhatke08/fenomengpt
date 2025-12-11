'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { User, CreditCard, Settings, Save, Eye, EyeOff, DollarSign, History, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  balance: number;
  role: string;
  createdAt: string;
}

interface Transaction {
  _id: string;
  type: 'deposit' | 'withdrawal' | 'order';
  amount: number;
  description: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showBalanceForm, setShowBalanceForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [balanceForm, setBalanceForm] = useState({
    amount: 0,
    paymentMethod: 'stripe'
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTransactions();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
        setProfileForm({
          username: data.data.username,
          email: data.data.email
        });
      } else {
        setError('Profil bilgileri yüklenirken hata oluştu');
      }
    } catch {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (err) {
      console.error('Transactions fetch error:', err);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileForm)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Profil güncellendi');
        updateUser(data.data);
        fetchProfile();
      } else {
        alert(data.message || 'Güncelleme sırasında hata oluştu');
      }
    } catch {
      alert('Bağlantı hatası');
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Yeni şifre en az 6 karakter olmalı');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Şifre güncellendi');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
      } else {
        alert(data.message || 'Şifre güncelleme sırasında hata oluştu');
      }
    } catch {
      alert('Bağlantı hatası');
    }
  };

  const handleBalanceTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (balanceForm.amount < 1) {
      alert('Minimum yükleme miktarı $1');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/balance/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(balanceForm)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Ödeme sayfasına yönlendiriliyorsunuz...');
        // In a real app, you would redirect to Stripe checkout
        // window.location.href = data.paymentUrl;
        setBalanceForm({ amount: 0, paymentMethod: 'stripe' });
        setShowBalanceForm(false);
        fetchProfile();
      } else {
        alert(data.message || 'Bakiye yükleme sırasında hata oluştu');
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
                Profil sayfasına erişmek için giriş yapmanız gerekiyor
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
            Profil Ayarları
          </h1>
          <p className="text-purple-200 text-lg">
            Hesap bilgilerinizi yönetin ve bakiye yükleyin
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="card-dark glow-effect">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-purple-400" />
                  <span className="gradient-text">Temel Bilgiler</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Kullanıcı Adı</Label>
                      <Input
                        id="username"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-posta</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button type="submit" className="button-primary glow-effect">
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      variant="outline"
                      className="button-secondary"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Şifre Değiştir
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Password Form */}
            {showPasswordForm && (
              <Card className="card-dark glow-effect">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-purple-400" />
                    <span className="gradient-text">Şifre Değiştir</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="newPassword">Yeni Şifre</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        required
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button type="submit" className="button-primary glow-effect">
                        <Save className="h-4 w-4 mr-2" />
                        Şifreyi Güncelle
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowPasswordForm(false)}
                        variant="outline"
                        className="button-secondary"
                      >
                        İptal
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Balance & Transactions */}
          <div className="space-y-6">
            {/* Balance Card */}
            <Card className="card-dark glow-effect">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-green-400" />
                  <span className="gradient-text">Bakiye</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    ${profile?.balance.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-purple-300 text-sm">Mevcut Bakiye</p>
                </div>
                
                <Button
                  onClick={() => setShowBalanceForm(true)}
                  className="w-full button-primary glow-effect"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Bakiye Yükle
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="card-dark glow-effect">
              <CardHeader>
                <CardTitle className="gradient-text">Hesap Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-purple-300">Kullanıcı Adı:</span>
                  <span className="text-white">{profile?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">E-posta:</span>
                  <span className="text-white text-sm">{profile?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Rol:</span>
                  <span className="text-white capitalize">{profile?.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Üyelik:</span>
                  <span className="text-white text-sm">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transactions */}
        <div className="mt-8">
          <Card className="card-dark glow-effect">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5 text-purple-400" />
                <span className="gradient-text">İşlem Geçmişi</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-purple-300">Henüz işlem geçmişiniz yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction._id} className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{transaction.description}</p>
                        <p className="text-purple-400 text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <div className={`font-bold ${
                        transaction.type === 'deposit' ? 'text-green-400' : 
                        transaction.type === 'withdrawal' ? 'text-red-400' : 
                        'text-yellow-400'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : 
                         transaction.type === 'withdrawal' ? '-' : ''}
                        ${transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Balance Top-up Modal */}
        {showBalanceForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="card-dark glow-effect w-full max-w-md">
              <CardHeader>
                <CardTitle className="gradient-text">Bakiye Yükle</CardTitle>
                <CardDescription>
                  Hesabınıza bakiye yükleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBalanceTopUp} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Miktar ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      step="0.01"
                      value={balanceForm.amount}
                      onChange={(e) => setBalanceForm({...balanceForm, amount: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="paymentMethod">Ödeme Yöntemi</Label>
                    <select
                      id="paymentMethod"
                      value={balanceForm.paymentMethod}
                      onChange={(e) => setBalanceForm({...balanceForm, paymentMethod: e.target.value})}
                      className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-200 focus:outline-none focus:border-purple-500"
                    >
                      <option value="stripe">Stripe (Kredi Kartı)</option>
                      <option value="paypal">PayPal</option>
                      <option value="crypto">Kripto Para</option>
                    </select>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      onClick={() => setShowBalanceForm(false)}
                      variant="outline"
                      className="flex-1 button-secondary"
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 button-primary glow-effect"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Yükle
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
