'use client';

import { useLocale } from '@/contexts/LocaleContext';
import { Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'bn' : 'en');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLocale}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 hover:bg-white/80 border border-amber-200 transition-all shadow-sm hover:shadow-md"
      title={locale === 'en' ? 'Switch to Bengali' : 'Switch to English'}
    >
      <Globe className="w-5 h-5 text-amber-600" />
      <span className="font-semibold text-gray-700">
        {locale === 'en' ? 'বাংলা' : 'English'}
      </span>
    </motion.button>
  );
}
