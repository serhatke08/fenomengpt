'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20"></div>
      <div className="absolute inset-0 cyber-grid"></div>
      
      {/* Content */}
      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold gradient-text neon-text mb-6">
            Fenomen GPT
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-purple-200 mb-8 leading-relaxed">
            Sosyal medya hesaplarınızı <span className="text-pink-400 font-semibold">profesyonel</span> seviyeye taşıyın
          </p>
          
          {/* Description */}
          <p className="text-lg text-purple-300 mb-12 max-w-2xl mx-auto">
            Instagram, TikTok ve diğer platformlarda takipçi, beğeni ve görüntüleme satın alın. 
            Hızlı, güvenli ve kaliteli hizmetlerle sosyal medya varlığınızı güçlendirin.
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-center justify-center space-x-2 text-purple-200">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span>Hızlı Teslimat</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-purple-200">
              <Shield className="h-5 w-5 text-green-400" />
              <span>Güvenli Ödeme</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-purple-200">
              <Clock className="h-5 w-5 text-blue-400" />
              <span>7/24 Destek</span>
            </div>
          </div>

          {/* CTA Buttons */}
          {!user ? (
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/register">
                <Button size="lg" className="button-primary glow-effect text-lg px-8 py-4">
                  Hemen Başla
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="lg" className="button-secondary glow-effect text-lg px-8 py-4">
                  Servisleri İncele
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/services">
                <Button size="lg" className="button-primary glow-effect text-lg px-8 py-4">
                  Servisleri Görüntüle
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/orders">
                <Button variant="outline" size="lg" className="button-secondary glow-effect text-lg px-8 py-4">
                  Siparişlerim
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
    </header>
  );
}
