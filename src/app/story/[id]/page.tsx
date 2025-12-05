'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Calendar, User, ArrowLeft, Loader2, Volume2, VolumeX, Plus, Clock, BookOpen, PenTool, Tag, ThumbsUp, ArrowBigUp, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { useAuth } from '@/contexts/AuthContext';
import StoryTranslator from '@/components/StoryTranslator';
import ClientOnly from '@/components/ClientOnly';
import Navbar from '@/components/Navbar';

interface Story {
  _id: string;
  title: string;
  content: string;
  images: Array<{ url: string }>;
  authorName: string;
  location: string;
  historicalPeriod?: string;
  tags?: string[];
  upvotes?: number;
  upvotedBy?: string[];
  createdAt: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function StoryPage() {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [synthesis, setSynthesis] = useState<SpeechSynthesisUtterance | null>(null);
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedContentsLabel, setTranslatedContentsLabel] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = (text: string, title?: string, contentsLabel?: string) => {
    if (text) {
      setIsTranslating(false);
      setTranslatedContent(text);
      if (title) setTranslatedTitle(title);
      if (contentsLabel) setTranslatedContentsLabel(contentsLabel);
    } else {
      setTranslatedContent(null);
      setTranslatedTitle(null);
      setTranslatedContentsLabel(null);
    }
  };

  useEffect(() => {
    if (params?.id) {
      fetchStory();
    }
    
    return () => {
      if (synthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [params?.id]);

  const fetchStory = async () => {
    if (!params?.id) return;
    
    try {
      const response = await fetch(`/api/stories/${params.id}`);
      const data = await response.json();
      
      if (data.story) {
        setStory(data.story);
        setUpvotes(data.story.upvotes || 0);
        if (user) {
          setHasUpvoted(data.story.upvotedBy?.includes(user.uid) || false);
        }
      } else {
        setStory(null);
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      setStory(null);
    } finally {
      setLoading(false);
    }
  };

  // Calculate reading time (average 200 words per minute)
  const readingTime = useMemo(() => {
    if (!story) return 0;
    const wordCount = story.content.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  }, [story]);

  // Helper to generate IDs
  const generateId = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, '-');
  };

  // Extract table of contents from markdown headings
  const tableOfContents = useMemo(() => {
    const contentToParse = translatedContent || story?.content;
    if (!contentToParse) return [];
    
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const toc: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(contentToParse)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = generateId(text);
      toc.push({ id, text, level });
    }

    return toc;
  }, [story, translatedContent]);

  const toggleAudio = () => {
    if (!story) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(story.content);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlaying(false);
      
      setSynthesis(utterance);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (upvoteLoading) return;

    setUpvoteLoading(true);
    // Optimistic update
    const newHasUpvoted = !hasUpvoted;
    setHasUpvoted(newHasUpvoted);
    setUpvotes(prev => newHasUpvoted ? prev + 1 : prev - 1);

    try {
      const { id } = params;
      const response = await fetch(`/api/stories/${id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (!response.ok) {
        // Revert on failure
        setHasUpvoted(!newHasUpvoted);
        setUpvotes(prev => !newHasUpvoted ? prev + 1 : prev - 1);
      } else {
        const data = await response.json();
        setUpvotes(data.upvotes);
        setHasUpvoted(data.hasUpvoted);
      }
    } catch (error) {
      console.error('Error upvoting:', error);
      // Revert on error
      setHasUpvoted(!newHasUpvoted);
      setUpvotes(prev => !newHasUpvoted ? prev + 1 : prev - 1);
    } finally {
      setUpvoteLoading(false);
    }
  };

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('story-content');
    if (!element) {
      console.error('Story content element not found');
      return;
    }

    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Clone the element to modify styles without affecting the UI
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Create a container for the clone to ensure it renders correctly for style computation
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = `${element.offsetWidth}px`; // Match original width
      container.appendChild(clone);
      document.body.appendChild(container);

      // Helper to convert colors to RGB using Canvas (handles lab, oklch, etc.)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');

      const toStandardColor = (color: string) => {
        if (!ctx || !color) return color;
        ctx.fillStyle = color;
        return ctx.fillStyle; // Browser converts to hex/rgb
      };

      const sanitizeColors = (el: HTMLElement) => {
        const style = window.getComputedStyle(el);
        
        // Properties to sanitize
        const colorProps = [
          'color', 
          'backgroundColor', 
          'borderTopColor', 
          'borderRightColor', 
          'borderBottomColor', 
          'borderLeftColor',
          'textDecorationColor'
        ];
        
        colorProps.forEach(prop => {
          // @ts-ignore
          const val = style[prop];
          if (val && (val.includes('lab(') || val.includes('oklch(') || val.startsWith('var('))) {
             // @ts-ignore
             el.style[prop] = toStandardColor(val);
          }
        });

        // Remove shadows as they often contain complex colors and are not critical for PDF
        el.style.boxShadow = 'none';
        el.style.textShadow = 'none';
        
        Array.from(el.children).forEach(child => sanitizeColors(child as HTMLElement));
      };

      // Apply sanitization to the clone (which is now in the DOM)
      sanitizeColors(clone);

      const opt = {
        margin: [0.5, 0.5] as [number, number],
        filename: `${story?.title || 'story'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(clone).save();
      
      // Cleanup
      document.body.removeChild(container);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Story not found'}</p>
          <button
            onClick={() => router.push('/feed')}
            className="text-gray-600 hover:text-gray-900 font-semibold"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navbar showBackButton />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Table of Contents Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                {translatedContentsLabel || 'Contents'}
              </h3>
              <nav className="space-y-1">
                {tableOfContents.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToHeading(item.id);
                    }}
                    className={`block text-sm py-1 border-l-2 pl-4 transition-colors border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300`}
                    style={{ marginLeft: `${(item.level - 1) * 0.5}rem` }}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <motion.div
              id="story-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Hero Image */}
              <div className="aspect-video rounded-2xl overflow-hidden shadow-lg relative">
                <img
                  src={story.images[currentImageIndex]?.url}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image Thumbnails */}
              {story.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide">
                  {story.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden transition-all ${
                        index === currentImageIndex
                          ? 'ring-2 ring-black ring-offset-2'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}



                <div className="px-4 sm:px-12 lg:px-16 py-6 sm:py-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-start md:items-center gap-4 w-full md:w-auto">
                          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">{translatedTitle || story.title}</h1>
                          <div className="flex items-center gap-2 mt-1 md:mt-0 flex-shrink-0">
                            {isAdmin && (
                              <button
                                onClick={() => router.push(`/story/${params?.id}/edit`)}
                                className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all"
                                title="Edit Story"
                              >
                                <PenTool className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={handleDownloadPDF}
                              className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all"
                              title="Download PDF"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                      </div>
                      <div className="flex flex-wrap gap-3 text-gray-600 mb-4">
                        <span className="flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          {story.location}
                        </span>
                        {story.historicalPeriod && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-2">
                              <Calendar className="w-5 h-5" />
                              {story.historicalPeriod}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          {story.authorName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          {readingTime} min read
                        </span>
                      </div>

                      {story.tags && story.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {story.tags.map((tag, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}


                    {/* Upvote Button */}
                    <div className="mb-8">
                      <button
                        onClick={handleUpvote}
                        disabled={upvoteLoading}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                          hasUpvoted
                            ? 'bg-black text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <ArrowBigUp className={`w-6 h-6 ${hasUpvoted ? 'fill-current' : ''}`} />
                        <span>{upvotes}</span>
                        <span>{hasUpvoted ? 'Upvoted' : 'Upvote'}</span>
                      </button>
                    </div>
                  </div>

                    <button
                      onClick={toggleAudio}
                      className="bg-black text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all flex-shrink-0 ml-4"
                      title={isPlaying ? 'Stop audio' : 'Listen to story'}
                    >
                      {isPlaying ? (
                        <VolumeX className="w-6 h-6" />
                      ) : (
                        <Volume2 className="w-6 h-6" />
                      )}
                    </button>
                  </div>



                  {/* Map View */}
                  <div className="mb-10 p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                      <MapPin className="w-5 h-5" />
                      Location
                    </h2>
                    <div className="rounded-lg overflow-hidden border border-gray-200 h-80">
                      <ClientOnly>
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          scrolling="no"
                          marginHeight={0}
                          marginWidth={0}
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(story.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                          style={{ border: 0 }}
                          title={`Map of ${story.location}`}
                        />
                      </ClientOnly>
                      <div className="mt-2 text-sm text-gray-600 text-center">
                        <a
                          href={`https://maps.google.com/maps?q=${encodeURIComponent(story.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                          View larger map →
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Translation Controls */}
                  <div className="mb-8 flex justify-end">
                    <StoryTranslator  
                      originalContent={story.content}
                      originalTitle={story.title}
                      onTranslate={handleTranslate}
                      onTranslateStart={() => setIsTranslating(true)}
                      isTranslating={isTranslating}
                    />
                  </div>

                  <div className="prose prose-lg md:prose-2xl max-w-none prose-headings:font-playfair prose-h1:text-4xl md:prose-h1:text-6xl prose-h1:mb-8 md:prose-h1:mb-12 prose-h2:text-3xl md:prose-h2:text-5xl prose-h2:mb-6 md:prose-h2:mb-10 prose-h3:text-2xl md:prose-h3:text-4xl prose-h3:mb-4 md:prose-h3:mb-8 prose-p:text-gray-800 prose-p:leading-loose prose-p:mb-6 prose-p:text-base md:prose-p:text-lg prose-li:text-base md:prose-li:text-lg prose-td:text-base md:prose-td:text-lg prose-th:text-base md:prose-th:text-lg prose-a:text-black prose-strong:text-gray-900 prose-ul:list-disc prose-ol:list-decimal prose-li:mb-3">
                    {isTranslating ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                        <p className="text-gray-600">Translating story...</p>
                      </div>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        components={{
                          h1: ({ children }) => {
                            const text = String(children);
                            const id = generateId(text);
                            return <h1 id={id} className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 mt-8 md:mt-12 font-playfair text-gray-900">{children}</h1>;
                          },
                          h2: ({ children }) => {
                            const text = String(children);
                            const id = generateId(text);
                            return <h2 id={id} className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 mt-6 md:mt-10 font-playfair text-gray-900">{children}</h2>;
                          },
                          h3: ({ children }) => {
                            const text = String(children);
                            const id = generateId(text);
                            return <h3 id={id} className="text-xl md:text-2xl font-bold mb-3 md:mb-4 mt-4 md:mt-8 font-playfair text-gray-900">{children}</h3>;
                          },
                          p: ({ children }) => (
                            <p className="text-base md:text-lg mb-6 leading-loose text-gray-800 font-normal">
                              {children}
                            </p>
                          ),
                          img: ({ src, alt }) => (
                            <span className="block mb-12">
                              <img
                                src={src}
                                alt={alt}
                                className="w-full h-auto rounded-lg shadow-md mb-3"
                              />
                              {alt && (
                                <span className="block text-center text-sm text-gray-500 font-playfair italic">
                                  {alt}
                                </span>
                              )}
                            </span>
                          ),
                        }}
                      >
                        {translatedContent || story.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {/* Bottom Upvote Button */}
                  <div className="flex justify-center mt-12 mb-8">
                    <button
                      onClick={handleUpvote}
                      disabled={upvoteLoading}
                      className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all ${
                        hasUpvoted
                          ? 'bg-black text-white shadow-xl scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                      }`}
                    >
                      <ArrowBigUp className={`w-8 h-8 ${hasUpvoted ? 'fill-current' : ''}`} />
                      <span>{upvotes}</span>
                      <span>{hasUpvoted ? 'Upvoted' : 'Upvote Story'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

  );
}
