'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Upload, X, Loader2, MapPin, Calendar, PenTool, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

export default function EditStoryPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [historicalPeriod, setHistoricalPeriod] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [images, setImages] = useState<Array<{ url: string; publicId: string; file?: File }>>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingStory, setLoadingStory] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (!authLoading && user && !isAdmin) {
      // Optional: Allow authors to edit their own stories? 
      // For now, restricting to admins as per request "if he is a admin"
      router.push('/feed'); 
    }
  }, [user, authLoading, isAdmin, router]);

  useEffect(() => {
    if (params?.id) {
      fetchStory();
    }
  }, [params?.id]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/stories/${params.id}`);
      const data = await response.json();
      if (data.story) {
        const s = data.story;
        setTitle(s.title);
        setContent(s.content);
        setLocation(s.location);
        setHistoricalPeriod(s.historicalPeriod || '');
        setTags(s.tags || []);
        setImages(s.images || []);
      } else {
        setError('Story not found');
      }
    } catch (err) {
      setError('Failed to fetch story');
    } finally {
      setLoadingStory(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const reader = new FileReader();
        return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
          reader.onloadend = async () => {
            try {
              const base64 = reader.result as string;
              const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64 }),
              });

              if (!response.ok) throw new Error('Upload failed');

              const data = await response.json();
              resolve({ url: data.url, publicId: data.publicId });
            } catch (err) {
              reject(err);
            }
          };
          reader.readAsDataURL(file);
        });
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setImages([...images, ...uploadedImages]);
    } catch (err) {
      setError('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = currentTag.trim();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
        setCurrentTag('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (images.length === 0) {
      setError('Please upload at least one image');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/stories/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          location,
          historicalPeriod,
          tags,
          images,
        }),
      });

      if (!response.ok) throw new Error('Failed to update story');

      router.push(`/story/${params.id}`);
    } catch (err) {
      setError('Failed to update story');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingStory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Should redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 
            className="text-3xl font-bold text-gray-900 cursor-pointer hover:text-gray-600 transition-colors"
            onClick={() => router.push('/feed')}
          >
            StorySnap
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-semibold"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white"
          >
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Story</h1>
              <p className="text-gray-600">Update story details</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <PenTool className="inline w-4 h-4 mr-2" />
                Story Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                placeholder="The Ancient Temple of..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-2" />
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Historical Period (Optional)
              </label>
              <input
                type="text"
                value={historicalPeriod}
                onChange={(e) => setHistoricalPeriod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                placeholder="e.g., 15th Century, Medieval Era"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                placeholder="Type a tag and press Enter..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Content (Markdown Supported)
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden" data-color-mode="light">
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || '')}
                  preview="live"
                  height={400}
                  textareaProps={{
                    placeholder: 'Write your historical story here using Markdown...'
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline w-4 h-4 mr-2" />
                Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-black transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {uploading ? (
                    <Loader2 className="w-12 h-12 text-gray-600 animate-spin mb-3" />
                  ) : (
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  )}
                  <span className="text-gray-600">
                    {uploading ? 'Uploading...' : 'Click to upload images'}
                  </span>
                  <span className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</span>
                </label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting || uploading}
                className="flex-1 bg-black text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Story'
                )}
              </motion.button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
    </div>
  );
}
