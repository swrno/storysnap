'use client';

import { useState } from 'react';
import { Globe, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryTranslatorProps {
  onTranslate: (translatedText: string, translatedTitle?: string, translatedContentsLabel?: string) => void;
  onTranslateStart: () => void;
  originalContent: string;
  originalTitle: string;
  isTranslating: boolean;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'bn', name: 'Bengali' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'hi', name: 'Hindi' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
];

export default function StoryTranslator({ onTranslate, onTranslateStart, originalContent, originalTitle, isTranslating }: StoryTranslatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [error, setError] = useState('');

  const handleTranslate = async (language: typeof LANGUAGES[0]) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    setError('');

    if (language.code === 'en') {
      onTranslate('', '', ''); // Reset to original
      return;
    }

    onTranslateStart();

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalContent,
          title: originalTitle,
          targetLanguage: language.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Translation failed');
      }

      if (data.translatedText) {
        onTranslate(data.translatedText, data.translatedTitle, data.translatedContentsLabel);
      }
    } catch (err) {
      console.error('Translation error:', err);
      setError('Failed to translate. Please check your API key or try again.');
    }
  };

  return (
    <div className="relative z-10">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-black transition-all shadow-sm hover:shadow-md"
        >
          {isTranslating ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
          ) : (
            <Globe className="w-5 h-5 text-gray-700" />
          )}
          <span className="font-semibold text-gray-700">{selectedLanguage.name}</span>
        </button>
      </div>

      {/* Language Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2 max-h-64 overflow-y-auto"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleTranslate(lang)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                  selectedLanguage.code === lang.code ? 'text-black font-semibold bg-gray-50' : 'text-gray-600'
                }`}
              >
                {lang.name}
                {selectedLanguage.code === lang.code && <Check className="w-4 h-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg shadow-lg border border-red-100 flex items-center gap-2 z-50"
          >
            <XCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
            <button onClick={() => setError('')} className="ml-2">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function XCircle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
