'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Globe, Volume2, Shield } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl sm:text-7xl font-bold text-gray-900 mb-6">
              StorySnap
            </h1>
            <p className="text-2xl sm:text-3xl text-gray-700 mb-4">
              Share Historical Stories
            </p>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              Document and discover fascinating tales from historical places around the world
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/feed')}
                className="bg-black text-white px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all"
              >
                Explore Stories
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/signup')}
                className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all border-2 border-gray-200"
              >
                Get Started
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg text-center"
          >
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Share Stories</h3>
            <p className="text-gray-600">
              Document historical places with captivating stories and images
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg text-center"
          >
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Bengali Support</h3>
            <p className="text-gray-600">
              Full support for Bengali language to preserve cultural heritage
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg text-center"
          >
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Volume2 className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Audio Stories</h3>
            <p className="text-gray-600">
              Listen to stories with text-to-speech narration
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg text-center"
          >
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Curated Content</h3>
            <p className="text-gray-600">
              All stories reviewed and approved by our team
            </p>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-12 border border-gray-100 shadow-2xl"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Share Your Story?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community and help preserve historical narratives for future generations
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/signup')}
            className="bg-black text-white px-10 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all"
          >
            Create Free Account
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
