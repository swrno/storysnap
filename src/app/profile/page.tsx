'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, ArrowLeft, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user, loading, router]);

  const handleSave = async () => {
    if (!user || !name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setSaving(true);
    setError('');
    setSaved(false);

    try {
      // Update Firebase profile
      await updateProfile(user, { displayName: name });

      // Update MongoDB
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user.uid,
          name: name.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/feed')}
            className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Feed</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">StorySnap</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-black px-8 py-12">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-lg border-4 border-white/50 flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Profile Settings</h2>
                <p className="text-white/90">Manage your account information</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 space-y-8">
            {/* Success Message */}
            {saved && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Profile updated successfully!</span>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <span className="text-red-800">{error}</span>
              </motion.div>
            )}

            {/* Name Field */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                <User className="w-4 h-4" />
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                placeholder="Enter your name"
              />
              <p className="text-sm text-gray-500">
                This is the name that will be displayed on your stories and profile.
              </p>
            </div>

            {/* Email Field (Read-only) */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
              <p className="text-sm text-gray-500">
                Your email address cannot be changed.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => router.push('/feed')}
                className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="bg-black text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Additional Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white rounded-xl p-6 border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3">Account Information</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-semibold">Account created:</span>{' '}
              {user?.metadata.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Last sign in:</span>{' '}
              {user?.metadata.lastSignInTime
                ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'N/A'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
