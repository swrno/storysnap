'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Eye, Clock, Users, Plus, LayoutGrid, Table as TableIcon } from 'lucide-react';
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
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentTab, setCurrentTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      checkAdminStatus();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchStories();
    }
  }, [isAdmin, currentTab]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: user?.uid }),
      });

      const data = await response.json();
      if (data.isAdmin) {
        setIsAdmin(true);
      } else {
        router.push('/feed');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      router.push('/feed');
    }
  };

  const fetchStories = async () => {
    setLoading(true);
    try {
      let url = '/api/stories';
      if (currentTab !== 'all') {
        url += `?status=${currentTab}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setStories(data.stories);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (storyId: string, action: 'approve' | 'reject') => {
    setActionLoading(storyId);

    try {
      const response = await fetch(`/api/admin/stories/${storyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminUid: user?.uid }),
      });

      if (response.ok) {
        // Refresh list or remove item depending on tab
        if (currentTab !== 'all') {
             setStories(stories.filter((s) => s._id !== storyId));
        } else {
            // If 'all', just update the status locally to reflect change immediately
            setStories(stories.map(s => s._id === storyId ? { ...s, status: action === 'approve' ? 'approved' : 'rejected' } : s));
        }
      }
    } catch (error) {
      console.error('Error updating story:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const tabs = [
    { id: 'all', label: 'All Stories' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
  ];

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
              <Users className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/feed')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-semibold"
            >
              Feed
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage and review stories</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                  currentTab === tab.id
                    ? 'bg-black text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Table View"
            >
              <TableIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
             <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
             </div>
          ) : stories.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No stories found</h3>
              <p className="text-gray-600">There are no stories in this category.</p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-gray-900">Story</th>
                      <th className="px-6 py-4 font-semibold text-gray-900">Author</th>
                      <th className="px-6 py-4 font-semibold text-gray-900">Location</th>
                      <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stories.map((story) => (
                      <tr key={story._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={story.images[0]?.url}
                              alt={story.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <span className="font-medium text-gray-900">{story.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {story.authorName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{story.location}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            story.status === 'approved' ? 'bg-green-100 text-green-700' :
                            story.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {story.status !== 'approved' && (
                              <button
                                onClick={() => handleAction(story._id, 'approve')}
                                disabled={actionLoading === story._id}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                {actionLoading === story._id ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-5 h-5" />
                                )}
                              </button>
                            )}
                            {story.status !== 'rejected' && (
                              <button
                                onClick={() => handleAction(story._id, 'reject')}
                                disabled={actionLoading === story._id}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => router.push(`/story/${story._id}`)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                              title="View"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            stories.map((story, index) => (
              <motion.div
                key={story._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-lg"
              >
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img
                      src={story.images[0]?.url}
                      alt={story.title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-2/3">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">{story.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                story.status === 'approved' ? 'bg-green-100 text-green-700' :
                                story.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                                {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {story.authorName}
                          </span>
                          <span>•</span>
                          <span>{story.location}</span>
                          {story.historicalPeriod && (
                            <>
                              <span>•</span>
                              <span>{story.historicalPeriod}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="prose prose-sm max-w-none line-clamp-3 mb-6">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {story.content}
                      </ReactMarkdown>
                    </div>

                    <div className="flex gap-3">
                      {story.status !== 'approved' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAction(story._id, 'approve')}
                            disabled={actionLoading === story._id}
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {actionLoading === story._id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                Approve
                              </>
                            )}
                          </motion.button>
                      )}

                      {story.status !== 'rejected' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAction(story._id, 'reject')}
                            disabled={actionLoading === story._id}
                            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-5 h-5" />
                            Reject
                          </motion.button>
                      )}

                      <button
                        onClick={() => router.push(`/story/${story._id}`)}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                      >
                        <Eye className="w-5 h-5" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
