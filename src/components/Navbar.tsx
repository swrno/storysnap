'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Plus, User, ArrowLeft, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  showBackButton?: boolean;
}

export default function Navbar({ showBackButton = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
            )}
            <h1
              className="text-2xl sm:text-3xl font-bold text-gray-900 cursor-pointer"
              onClick={() => handleNavigation('/feed')}
            >
              StorySnap
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <button
                  onClick={() => handleNavigation('/create-story')}
                  className="bg-black text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Share Story
                </button>
                <button
                  onClick={() => handleNavigation('/profile')}
                  className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                  title="Profile"
                >
                  <User className="w-5 h-5" />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleNavigation('/admin')}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-semibold"
                  >
                    Admin
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => handleNavigation('/login')}
                className="bg-black text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {user ? (
                <>
                  <button
                    onClick={() => handleNavigation('/create-story')}
                    className="w-full bg-black text-white px-6 py-3 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Share Story
                  </button>
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleNavigation('/admin')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                    >
                      <Users className="w-5 h-5" />
                      Admin Dashboard
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => handleNavigation('/login')}
                  className="w-full bg-black text-white px-6 py-3 rounded-lg font-semibold shadow-md"
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
