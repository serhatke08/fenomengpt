'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Menu, X, User, LogOut, Settings, CreditCard } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-purple-500/30 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FG</span>
            </div>
            <span className="text-2xl font-bold gradient-text neon-text">
              Fenomen GPT
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-purple-200 hover:text-white transition-colors">
              Ana Sayfa
            </Link>
            <Link href="/services" className="text-purple-200 hover:text-white transition-colors">
              Servisler
            </Link>
            <Link href="/orders" className="text-purple-200 hover:text-white transition-colors">
              Siparişlerim
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-purple-200">
                  <CreditCard className="h-4 w-4" />
                  <span>${user.balance.toFixed(2)}</span>
                </div>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-purple-200 hover:text-white transition-colors">
                    <User className="h-4 w-4" />
                    <span>{user.username}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-md border border-purple-500/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link href="/profile" className="flex items-center space-x-2 px-4 py-2 text-purple-200 hover:text-white hover:bg-purple-500/20 transition-colors">
                        <Settings className="h-4 w-4" />
                        <span>Profil</span>
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="outline" className="button-secondary glow-effect">
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="button-primary glow-effect">
                    Kaydol
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-purple-200 hover:text-white transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-500/30">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-purple-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              <Link 
                href="/services" 
                className="text-purple-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Servisler
              </Link>
              <Link 
                href="/orders" 
                className="text-purple-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Siparişlerim
              </Link>
              
              {user ? (
                <div className="pt-4 border-t border-purple-500/30">
                  <div className="flex items-center space-x-2 text-purple-200 mb-4">
                    <CreditCard className="h-4 w-4" />
                    <span>Bakiye: ${user.balance.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Link 
                      href="/profile" 
                      className="flex items-center space-x-2 text-purple-200 hover:text-white transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-purple-500/30 flex flex-col space-y-3">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="button-secondary glow-effect w-full">
                      Giriş Yap
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="button-primary glow-effect w-full">
                      Kaydol
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
