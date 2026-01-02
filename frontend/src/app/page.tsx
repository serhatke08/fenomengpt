'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HomePage() {

  return (
    <div className="min-h-screen cyber-grid">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold gradient-text mb-6">
              Sosyal Medya
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Büyütme
              </span>
              <br />
              Platformu
            </h1>
            <p className="text-xl md:text-2xl text-purple-200 mb-8 leading-relaxed">
              Instagram, TikTok, YouTube ve X hesaplarınızı profesyonel servislerimizle büyütün.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="button-primary glow-effect text-lg px-8 py-4">
                  Hemen Başla
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline" className="button-secondary glow-effect text-lg px-8 py-4">
                  Servisleri Gör
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-16 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Neden Bizi Seçmelisiniz?
            </h2>
            <p className="text-xl text-purple-200">
              Profesyonel hizmetlerimizle sosyal medya hesaplarınızı büyütün
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Hızlı Teslimat</h3>
              <p className="text-purple-200">
                Siparişleriniz 24 saat içinde başlar ve hızlı bir şekilde tamamlanır.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Güvenli Ödeme</h3>
              <p className="text-purple-200">
                Tüm ödemeleriniz güvenli şekilde işlenir ve korunur.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">7/24 Destek</h3>
              <p className="text-purple-200">
                Her zaman yanınızdayız. Sorularınız için 7/24 destek alabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 pb-24 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold gradient-text mb-4">
            Hemen Başlayın!
          </h2>
          <p className="text-xl text-purple-200 mb-8">
            Sosyal medya hesaplarınızı büyütmeye bugün başlayın
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="button-primary glow-effect text-lg px-8 py-4">
                Ücretsiz Hesap Oluştur
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/services">
              <Button size="lg" variant="outline" className="button-secondary glow-effect text-lg px-8 py-4">
                Tüm Servisleri Gör
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}