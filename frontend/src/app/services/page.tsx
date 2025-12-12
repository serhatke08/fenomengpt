'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';

interface Service {
  service: number;
  name: string;
  type: string;
  category?: string;
  rate: string;
  min: string;
  max: string;
  refill: boolean;
  cancel: boolean;
  dripfeed?: boolean;
}

const platformNames = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  twitter: 'Twitter',
  x: 'X (Twitter)',
  facebook: 'Facebook',
  spotify: 'Spotify',
  telegram: 'Telegram'
};

const PlatformIcon = ({ platform }: { platform: string }) => {
  const platformLower = platform.toLowerCase();
  const iconSize = 24;
  
  // Gerçek uygulama logoları - Simple Icons CDN
  const getIconUrl = (platformName: string) => {
    const icons: { [key: string]: string } = {
      instagram: 'https://cdn.simpleicons.org/instagram/FFFFFF',
      tiktok: 'https://cdn.simpleicons.org/tiktok/FFFFFF',
      youtube: 'https://cdn.simpleicons.org/youtube/FFFFFF',
      twitter: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/x.svg',
      x: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/x.svg',
      facebook: 'https://cdn.simpleicons.org/facebook/FFFFFF',
      spotify: 'https://cdn.simpleicons.org/spotify/FFFFFF',
      telegram: 'https://cdn.simpleicons.org/telegram/FFFFFF'
    };
    return icons[platformName] || icons.instagram;
  };
  
  let iconUrl = getIconUrl('instagram');
  
  if (platformLower === 'instagram' || platformLower.includes('instagram')) {
    iconUrl = getIconUrl('instagram');
  } else if (platformLower === 'tiktok' || platformLower.includes('tiktok') || platformLower.includes('tt')) {
    iconUrl = getIconUrl('tiktok');
  } else if (platformLower === 'youtube' || platformLower.includes('youtube') || platformLower.includes('yt')) {
    iconUrl = getIconUrl('youtube');
  } else if (platformLower === 'twitter' || platformLower === 'x' || platformLower.includes('twitter') || platformLower.includes('x')) {
    iconUrl = getIconUrl('x');
  } else if (platformLower === 'facebook' || platformLower.includes('facebook') || platformLower.includes('fb')) {
    iconUrl = getIconUrl('facebook');
  } else if (platformLower === 'spotify' || platformLower.includes('spotify')) {
    iconUrl = getIconUrl('spotify');
  } else if (platformLower === 'telegram' || platformLower.includes('telegram')) {
    iconUrl = getIconUrl('telegram');
  }
  
  // X/Twitter için özel SVG kullan
  if (platformLower === 'twitter' || platformLower === 'x' || platformLower.includes('twitter') || platformLower.includes('x')) {
    return (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  
  return (
    <Image
      src={iconUrl}
      alt={platform}
      width={iconSize}
      height={iconSize}
      className="w-6 h-6"
      unoptimized
    />
  );
};

// Fiyat formatlama: tam sayı ise ondalık yok, değilse max 2 ondalık
const formatPrice = (price: number): string => {
  if (price % 1 === 0) {
    return price.toString();
  }
  return price.toFixed(2);
};

// Platform belirleme
const getPlatformFromCategory = (category: string | undefined): string => {
  if (!category) return 'instagram';
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('instagram') || categoryLower.includes('ig')) {
    return 'instagram';
  } else if (categoryLower.includes('tiktok') || categoryLower.includes('tt')) {
    return 'tiktok';
  } else if (categoryLower.includes('youtube') || categoryLower.includes('yt')) {
    return 'youtube';
  } else if (categoryLower.includes('twitter') || categoryLower.includes('tw') || categoryLower.includes('x')) {
    return 'twitter';
  } else if (categoryLower.includes('facebook') || categoryLower.includes('fb')) {
    return 'facebook';
  } else if (categoryLower.includes('telegram')) {
    return 'telegram';
  } else if (categoryLower.includes('spotify')) {
    return 'spotify';
  } else if (categoryLower.includes('twitch')) {
    return 'twitch';
  }
  return 'instagram';
};

// Service Group belirleme
const getServiceGroup = (type: string | undefined, category: string | undefined): string => {
  if (!type && !category) return 'other';
  const typeLower = (type || '').toLowerCase();
  const categoryLower = (category || '').toLowerCase();
  
  if (typeLower.includes('follower') || categoryLower.includes('follower')) {
    return 'followers';
  } else if (typeLower.includes('like') || categoryLower.includes('like')) {
    return 'likes';
  } else if (typeLower.includes('view') || categoryLower.includes('view')) {
    return 'views';
  } else if (typeLower.includes('comment') || categoryLower.includes('comment')) {
    return 'comments';
  } else if (typeLower.includes('share') || categoryLower.includes('share')) {
    return 'shares';
  } else if (typeLower.includes('subscriber') || categoryLower.includes('subscriber')) {
    return 'subscribers';
  } else if (typeLower.includes('reaction') || categoryLower.includes('reaction')) {
    return 'reactions';
  } else if (typeLower.includes('member') || categoryLower.includes('member')) {
    return 'members';
  } else if (typeLower.includes('play') || categoryLower.includes('play')) {
    return 'plays';
  } else if (typeLower.includes('stream') || categoryLower.includes('stream')) {
    return 'streams';
  } else if (typeLower.includes('vote') || typeLower.includes('poll')) {
    return 'votes';
  }
  return 'other';
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Seçimler
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedServiceGroup, setSelectedServiceGroup] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState<number>(0);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/services`);
      if (!response.ok) {
        throw new Error('Servisler yüklenemedi');
      }
      const data = await response.json();
      setServices(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Servis isimlerini Türkçe'ye çevir
  const translateServiceName = (name: string): string => {
    let translated = name;
    
    // Genel terimler
    translated = translated.replace(/followers?/gi, 'Takipçi');
    translated = translated.replace(/likes?/gi, 'Beğeni');
    translated = translated.replace(/views?/gi, 'Görüntüleme');
    translated = translated.replace(/comments?/gi, 'Yorum');
    translated = translated.replace(/shares?/gi, 'Paylaşım');
    translated = translated.replace(/subscribers?/gi, 'Abone');
    translated = translated.replace(/reactions?/gi, 'Reaksiyon');
    translated = translated.replace(/members?/gi, 'Üye');
    translated = translated.replace(/plays?/gi, 'Çalma');
    translated = translated.replace(/stream/gi, 'Yayın');
    translated = translated.replace(/votes?/gi, 'Oy');
    translated = translated.replace(/poll/gi, 'Anket');
    
    // Platform isimleri
    translated = translated.replace(/instagram/gi, 'Instagram');
    translated = translated.replace(/tiktok/gi, 'TikTok');
    translated = translated.replace(/youtube/gi, 'YouTube');
    translated = translated.replace(/twitter/gi, 'Twitter');
    translated = translated.replace(/facebook/gi, 'Facebook');
    translated = translated.replace(/telegram/gi, 'Telegram');
    translated = translated.replace(/spotify/gi, 'Spotify');
    translated = translated.replace(/twitch/gi, 'Twitch');
    
    // Zaman terimleri
    translated = translated.replace(/\b1h\b/gi, '1 Saat');
    translated = translated.replace(/\b12h\b/gi, '12 Saat');
    translated = translated.replace(/\b24h\b/gi, '24 Saat');
    translated = translated.replace(/\b1d\b/gi, '1 Gün');
    translated = translated.replace(/\b1w\b/gi, '1 Hafta');
    translated = translated.replace(/\b1m\b/gi, '1 Ay');
    
    // Ülke isimleri
    translated = translated.replace(/\busa\b/gi, 'ABD');
    translated = translated.replace(/\bturkey\b/gi, 'Türkiye');
    translated = translated.replace(/\brussia\b/gi, 'Rusya');
    translated = translated.replace(/\bgermany\b/gi, 'Almanya');
    translated = translated.replace(/\bfrance\b/gi, 'Fransa');
    translated = translated.replace(/\bitaly\b/gi, 'İtalya');
    translated = translated.replace(/\bspain\b/gi, 'İspanya');
    translated = translated.replace(/\bcanada\b/gi, 'Kanada');
    translated = translated.replace(/\buk\b/gi, 'İngiltere');
    translated = translated.replace(/\bunited kingdom\b/gi, 'İngiltere');
    translated = translated.replace(/\bindia\b/gi, 'Hindistan');
    translated = translated.replace(/\bchina\b/gi, 'Çin');
    translated = translated.replace(/\bbrazil\b/gi, 'Brezilya');
    translated = translated.replace(/\bmexico\b/gi, 'Meksika');
    translated = translated.replace(/\baustralia\b/gi, 'Avustralya');
    translated = translated.replace(/\bjapan\b/gi, 'Japonya');
    translated = translated.replace(/\bsouth korea\b/gi, 'Güney Kore');
    
    // Diğer terimler
    translated = translated.replace(/random/gi, 'Rastgele');
    translated = translated.replace(/premium/gi, 'Premium');
    translated = translated.replace(/auto/gi, 'Otomatik');
    translated = translated.replace(/high quality/gi, 'Yüksek Kalite');
    translated = translated.replace(/organic/gi, 'Organik');
    translated = translated.replace(/country targeted/gi, 'Ülke Hedefli');
    translated = translated.replace(/language targeted/gi, 'Dil Hedefli');
    
    return translated;
  };


  // Service Group isimleri
  const serviceGroupNames: { [key: string]: string } = {
    followers: 'Takipçi',
    likes: 'Beğeni',
    views: 'Görüntüleme',
    comments: 'Yorum',
    shares: 'Paylaşım',
    subscribers: 'Abone',
    reactions: 'Reaksiyon',
    members: 'Üye',
    plays: 'Çalma',
    streams: 'Yayın',
    votes: 'Oy/Anket',
    other: 'Diğer'
  };

  // Platform listesi
  const platforms = useMemo(() => {
    const platformSet = new Set<string>();
    services.forEach(service => {
      const platform = getPlatformFromCategory(service.category);
      platformSet.add(platform);
    });
    return Array.from(platformSet).sort();
  }, [services]);

  // Seçilen platforma göre servisler
  const platformServices = useMemo(() => {
    if (!selectedPlatform) return [];
    return services.filter(service => {
      const platform = getPlatformFromCategory(service.category);
      return platform === selectedPlatform;
    });
  }, [services, selectedPlatform]);

  // Seçilen platforma göre Service Group listesi
  const platformServiceGroups = useMemo(() => {
    if (!selectedPlatform) return [];
    const groupSet = new Set<string>();
    platformServices.forEach(service => {
      const group = getServiceGroup(service.type, service.category);
      groupSet.add(group);
    });
    return Array.from(groupSet).sort();
  }, [platformServices, selectedPlatform]);

  // Seçilen platform ve service group'a göre servisler
  const groupServices = useMemo(() => {
    if (!selectedPlatform || !selectedServiceGroup) return [];
    return platformServices.filter(service => {
      const group = getServiceGroup(service.type, service.category);
      return group === selectedServiceGroup;
    });
  }, [platformServices, selectedServiceGroup, selectedPlatform]);

  // Seçilen platform ve service group'a göre Category listesi
  const groupCategories = useMemo(() => {
    if (!selectedPlatform || !selectedServiceGroup) return [];
    const categorySet = new Set<string>();
    groupServices.forEach(service => {
      if (service.category) {
        categorySet.add(service.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [groupServices, selectedPlatform, selectedServiceGroup]);

  // Seçilen platform, service group ve category'ye göre servisler
  const categoryServices = useMemo(() => {
    if (!selectedPlatform || !selectedServiceGroup || !selectedCategory) return [];
    return groupServices.filter(service => {
      return service.category === selectedCategory;
    });
  }, [groupServices, selectedCategory, selectedPlatform, selectedServiceGroup]);

  // Platform seçildiğinde diğer seçimleri sıfırla
  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
    setSelectedServiceGroup('');
    setSelectedCategory('');
    setSelectedService(null);
    setLink('');
    setQuantity(0);
  };

  // Service Group seçildiğinde diğer seçimleri sıfırla
  const handleServiceGroupSelect = (group: string) => {
    setSelectedServiceGroup(group);
    setSelectedCategory('');
    setSelectedService(null);
    setLink('');
    setQuantity(0);
  };

  // Category seçildiğinde diğer seçimleri sıfırla
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedService(null);
    setLink('');
    setQuantity(0);
  };

  // Service seçildiğinde quantity'yi min değerine ayarla
  const handleServiceSelect = (serviceId: string) => {
    const service = categoryServices.find(s => s.service.toString() === serviceId);
    if (service) {
      setSelectedService(service);
      setQuantity(parseInt(service.min));
    } else {
      setSelectedService(null);
      setQuantity(0);
    }
  };

  // Quantity değiştiğinde
  const handleQuantityChange = (value: number) => {
    if (!selectedService) return;
    const min = parseInt(selectedService.min);
    const max = parseInt(selectedService.max);
    if (value >= min && value <= max) {
      setQuantity(value);
    } else if (value < min) {
      setQuantity(min);
    } else if (value > max) {
      setQuantity(max);
    }
  };

  // Toplam fiyat hesaplama
  const totalPrice = useMemo(() => {
    if (!selectedService || !quantity) return 0;
    const rate = parseFloat(selectedService.rate);
    return (rate * quantity) / 1000;
  }, [selectedService, quantity]);

  if (loading) {
    return (
      <div className="min-h-screen cyber-grid">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-purple-200 mt-4">Servisler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen cyber-grid">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-400 text-lg">{error}</p>
            <button 
              onClick={fetchServices}
              className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4 neon-text">
            Servisler
          </h1>
          <p className="text-purple-200 text-lg">
            Sosyal medya platformları için profesyonel servisler
          </p>
        </div>

        {/* Platform Butonları */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
          <label className="block text-sm font-medium text-purple-200 mb-4">
            Platform
          </label>
          <div className="flex flex-wrap gap-3">
            {platforms.map((platform) => {
              // Platform değerini kontrol et
              const platformKey = platform.toLowerCase();
              return (
                <button
                  key={platform}
                  onClick={() => handlePlatformSelect(platform)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    selectedPlatform === platform
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-600'
                  }`}
                >
                  <PlatformIcon platform={platformKey} />
                  <span>{platformNames[platformKey as keyof typeof platformNames] || platform}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Service Group Dropdown */}
        {selectedPlatform && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Service Group
            </label>
            <div className="relative">
              <select
                value={selectedServiceGroup}
                onChange={(e) => handleServiceGroupSelect(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-purple-500"
              >
                <option value="">Service Group Seçin</option>
                {platformServiceGroups.map(group => (
                  <option key={group} value={group}>
                    {serviceGroupNames[group] || group}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Category Dropdown */}
        {selectedPlatform && selectedServiceGroup && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Category
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-purple-500"
              >
                <option value="">Category Seçin</option>
                {groupCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Service (Price/1000) Dropdown */}
        {selectedPlatform && selectedServiceGroup && selectedCategory && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-purple-200">
                Service (Price/1000)
              </label>
              {selectedService && (
                <span className="text-green-400 font-bold text-lg">
                  ${formatPrice(parseFloat(selectedService.rate))}
                </span>
              )}
            </div>
            <div className="relative">
              <select
                value={selectedService?.service.toString() || ''}
                onChange={(e) => handleServiceSelect(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-purple-500"
              >
                <option value="">Service Seçin</option>
                {categoryServices.map(service => (
                  <option key={service.service} value={service.service.toString()}>
                    {service.service} - {translateServiceName(service.name)} - ${formatPrice(parseFloat(service.rate))}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Description */}
        {selectedService && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
            <h4 className="text-white font-semibold mb-4">Description</h4>
            <div className="text-gray-300 text-sm space-y-3">
              <div className="border-t border-gray-700 pt-3">
                <p className="text-purple-300 font-medium">Quality: High</p>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <p className="text-white font-medium">Profile Has:</p>
                <ul className="list-disc list-inside ml-2 mt-2 space-y-1 text-gray-400">
                  <li>Profile Picture</li>
                  <li>Description</li>
                  <li>Followers</li>
                  <li>Publications</li>
                  <li>Stories</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Link */}
        {selectedService && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Link <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://instagram.com/username"
              required
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            {!link && (
              <p className="text-red-400 text-xs mt-1">Link zorunludur</p>
            )}
          </div>
        )}

        {/* Quantity */}
        {selectedService && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || parseInt(selectedService.min))}
              min={parseInt(selectedService.min)}
              max={parseInt(selectedService.max)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            />
            <p className="text-gray-400 text-sm mt-2">
              Min: {parseInt(selectedService.min).toLocaleString()} - Max: {parseInt(selectedService.max).toLocaleString()}
            </p>
          </div>
        )}

        {/* Average time ve Charge */}
        {selectedService && quantity > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-gray-400 text-sm block mb-1">Average time</span>
                <p className="text-white font-semibold text-lg">46 minutes</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm block mb-1">Charge</span>
                <p className="text-green-400 font-bold text-2xl">${formatPrice(totalPrice)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Sipariş Butonu */}
        {selectedService && link && quantity >= parseInt(selectedService.min) && quantity <= parseInt(selectedService.max) && (
          <button 
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-lg"
          >
            Sipariş Ver - ${formatPrice(totalPrice)}
          </button>
        )}
      </div>
    </div>
  );
}
