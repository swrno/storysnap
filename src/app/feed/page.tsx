'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Calendar, User, Plus, Loader2, Search, Tag, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


interface Story {
  _id: string;
  title: string;
  content: string;
  images: Array<{ url: string }>;
  authorName: string;
  location: string;
  historicalPeriod?: string;
  tags?: string[];
  createdAt: string;
}

export default function FeedPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories?status=approved');
      const data = await response.json();
      setStories(data.stories);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract all unique tags
  const allTags = Array.from(new Set(stories.flatMap(story => story.tags || []))).sort();

  const filteredStories = stories.filter((story) => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? story.tags?.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">StorySnap</h1>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <button
                  onClick={() => router.push('/create-story')}
                  className="bg-black text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Share Story
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                  title="Profile"
                >
                  <User className="w-5 h-5" />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Admin
                  </button>
                )}
              </>
            )}
            {!user && (
              <button
                onClick={() => router.push('/login')}
                className="bg-black text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Discover Historical Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Explore fascinating tales from historical places around the world
          </p>

          <div className="max-w-2xl mx-auto mb-8 flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or location..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full shadow-sm focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className="relative inline-block text-left min-w-[160px]">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-3 shadow-sm hover:border-gray-300 transition-colors h-full">
                  <Filter className="w-4 h-4 text-gray-500 shrink-0" />
                  <select
                    value={selectedTag || ''}
                    onChange={(e) => setSelectedTag(e.target.value || null)}
                    className="bg-transparent border-none outline-none text-gray-700 font-medium cursor-pointer appearance-none pr-6 w-full"
                    style={{ backgroundImage: 'none' }}
                  >
                    <option value="">All Tags</option>
                    {allTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">
              {searchQuery ? 'No stories found matching your search.' : 'No stories yet. Be the first to share!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStories.map((story, index) => (
              <motion.div
                key={story._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(`/story/${story._id}`)}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={story.images[0]?.url}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-2">{story.title}</h3>
                  </div>
                </div>

                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {story.location}
                      </span>
                      {story.historicalPeriod && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {story.historicalPeriod}
                          </span>
                        </>
                      )}
                    </div>

                    {story.tags && story.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {story.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {story.tags.length > 3 && (
                          <span className="text-xs text-gray-500 self-center">+{story.tags.length - 3} more</span>
                        )}
                      </div>
                    )}

                    <div className="prose prose-sm max-w-none line-clamp-3 mb-4">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {story.content}
                      </ReactMarkdown>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{story.authorName}</span>
                    </div>
                  </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
