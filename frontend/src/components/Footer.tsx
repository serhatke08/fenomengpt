'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black/40 backdrop-blur-sm border-t border-gray-800 mt-auto pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold gradient-text mb-4">Panel</h3>
            <p className="text-gray-400 text-sm">
              Sosyal medya hesaplarınızı profesyonel servislerimizle büyütün.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/services" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Servisler
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Siparişlerim
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">İletişim</h4>
            <p className="text-gray-400 text-sm">
              7/24 destek hizmetimizle yanınızdayız.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Panel. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}

