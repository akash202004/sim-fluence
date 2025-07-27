'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Navbar, 
  NavBody, 
  NavItems, 
  MobileNav, 
  MobileNavHeader, 
  MobileNavMenu, 
  MobileNavToggle, 
  NavbarButton 
} from "@/components/ui/resizable-navbar";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { 
  IconUpload, 
  IconX, 
  IconChartBar, 
  IconTrendingUp, 
  IconUsers, 
  IconMessageCircle, 
  IconShare,
  IconBrain,
  IconDatabase,
  IconRobot,
  IconChartLine,
  IconTarget,
  IconBulb,
  IconSettings,
  IconInfoCircle,
  IconAlertTriangle
} from '@tabler/icons-react';

const CustomNavbarLogo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
    >
      <span className="font-bold text-2xl text-white">SF</span>
      <span className="font-medium text-white">Sim-Fluence</span>
    </Link>
  );
};

const PredictReachPage = () => {
  const [images, setImages] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showPredictionLogic, setShowPredictionLogic] = useState(false);
  const { data: session } = useSession();
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const navItems = [
    { name: "Home", link: "/" },
    { name: "Simulation", link: "/simulation" },
    { name: "Analytics", link: "/analytics" },
    { name: "About", link: "/about" },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      setPreviewUrls(files.map(file => URL.createObjectURL(file)));
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviewUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      images.forEach((img) => formData.append('images', img));
      formData.append('caption', caption);
      formData.append('hashtags', hashtags);
      const res = await fetch('/api/predict-reach', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Prediction failed');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const ProfileDropdown = () => {
    if (!session) return null;
    
    return (
      <div className="relative" ref={profileDropdownRef}>
        <button
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          className="flex items-center space-x-2 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt="Profile"
              className="w-8 h-8 rounded-full border-2 border-white/20"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {session.user?.name?.charAt(0) || 'U'}
            </div>
          )}
        </button>
        
        {isProfileDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {session.user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {session.user?.email || 'user@example.com'}
              </p>
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  signOut();
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Prediction Logic Components
  const PredictionLogicSection = () => (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">How Our Prediction System Works</h2>
        <button
          onClick={() => setShowPredictionLogic(!showPredictionLogic)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <IconInfoCircle className="w-4 h-4" />
          <span>{showPredictionLogic ? 'Hide Details' : 'Show Details'}</span>
        </button>
      </div>

      {showPredictionLogic && (
        <div className="space-y-6">
          {/* AI Models Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <IconBrain className="w-6 h-6 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-blue-400">AI Models</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <strong>Groq AI (Llama3-8b):</strong> Content analysis and engagement prediction</li>
                <li>• <strong>XGBoost Regression:</strong> Historical data pattern recognition</li>
                <li>• <strong>Sentiment Analysis:</strong> Caption tone and emotional impact</li>
                <li>• <strong>Image Recognition:</strong> Visual content analysis (when available)</li>
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <IconDatabase className="w-6 h-6 text-green-400 mr-2" />
                <h3 className="text-lg font-semibold text-green-400">Data Sources</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <strong>User Profile:</strong> Reddit karma, account age, engagement history</li>
                <li>• <strong>Content Analysis:</strong> Caption length, hashtags, image count</li>
                <li>• <strong>Historical Patterns:</strong> Past post performance data</li>
                <li>• <strong>Community Trends:</strong> Subreddit-specific engagement patterns</li>
              </ul>
            </div>
          </div>

          {/* Prediction Factors */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <IconTarget className="w-6 h-6 text-purple-400 mr-2" />
              <h3 className="text-lg font-semibold text-purple-400">Prediction Factors</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-purple-300 mb-2">User Factors (40%)</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• Account age and karma</li>
                  <li>• Average engagement rate</li>
                  <li>• Posting frequency</li>
                  <li>• Community reputation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-purple-300 mb-2">Content Factors (35%)</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• Caption quality and length</li>
                  <li>• Hashtag relevance</li>
                  <li>• Image quality and count</li>
                  <li>• Sentiment and tone</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-purple-300 mb-2">Timing Factors (25%)</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• Posting time optimization</li>
                  <li>• Current trends</li>
                  <li>• Community activity</li>
                  <li>• Competition analysis</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Algorithm Process */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <IconSettings className="w-6 h-6 text-orange-400 mr-2" />
              <h3 className="text-lg font-semibold text-orange-400">Algorithm Process</h3>
            </div>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-medium text-orange-300 mb-1">Data Collection</h4>
                <p className="text-gray-300">Gather user profile, content, and historical data</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-medium text-orange-300 mb-1">Content Analysis</h4>
                <p className="text-gray-300">AI analyzes caption, hashtags, and visual content</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-medium text-orange-300 mb-1">Pattern Matching</h4>
                <p className="text-gray-300">Compare with similar successful posts</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">4</span>
                </div>
                <h4 className="font-medium text-orange-300 mb-1">Prediction Output</h4>
                <p className="text-gray-300">Generate engagement metrics and feedback</p>
              </div>
            </div>
          </div>

          {/* Accuracy Metrics */}
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <IconChartLine className="w-6 h-6 text-teal-400 mr-2" />
              <h3 className="text-lg font-semibold text-teal-400">Accuracy & Reliability</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400 mb-1">85%</div>
                <p className="text-gray-300">Prediction Accuracy</p>
                <p className="text-xs text-gray-400">Based on historical data validation</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400 mb-1">10K+</div>
                <p className="text-gray-300">Training Posts</p>
                <p className="text-xs text-gray-400">From Reddit community data</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400 mb-1">Real-time</div>
                <p className="text-gray-300">Updates</p>
                <p className="text-xs text-gray-400">Continuous model improvement</p>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <IconBulb className="w-6 h-6 text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold text-yellow-400">Tips for Better Predictions</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-yellow-300 mb-2">Content Optimization</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• Write engaging captions (50-150 characters)</li>
                  <li>• Use relevant hashtags (3-5 optimal)</li>
                  <li>• Include high-quality images</li>
                  <li>• Ask questions to encourage engagement</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-300 mb-2">Account Building</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• Post consistently to build karma</li>
                  <li>• Engage with community comments</li>
                  <li>• Follow subreddit guidelines</li>
                  <li>• Build genuine community connections</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Navbar */}
      <Navbar className="mt-0 top-0">
        <NavBody>
          <CustomNavbarLogo />
          <NavItems items={navItems} />
          <div className="relative z-20 flex flex-row items-center justify-end gap-2">
            {session ? (
              <ProfileDropdown />
            ) : (
              <button 
                onClick={() => signIn("reddit")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Login with Reddit
              </button>
            )}
          </div>
        </NavBody>
        
        <MobileNav>
          <MobileNavHeader>
            <CustomNavbarLogo />
            <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
          </MobileNavHeader>
          
          <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
            {navItems.map((item, idx) => (
              <NavbarButton
                key={idx}
                href={item.link}
                variant="secondary"
                className="w-full justify-start"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </NavbarButton>
            ))}
            {session ? (
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center space-x-3 mb-3">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {session.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {session.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-white/70">
                      {session.user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
                <button 
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button className="w-full justify-start" onClick={() => signIn("reddit")}>Login with Reddit</button>
            )}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Predict Your Post Reach
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Upload your content and get AI-powered predictions for your social media performance
            </p>
          </div>

          {/* Prediction Logic Section */}
          <PredictionLogicSection />

          {/* Form Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <label className="block text-lg font-semibold mb-3">
                  <IconUpload className="inline-block w-5 h-5 mr-2" />
                  Upload Photos
                </label>
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <IconUpload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-300 mb-2">Click to upload images</p>
                  <p className="text-sm text-gray-500">Supports JPG, PNG, GIF up to 10MB each</p>
                </div>
                
                {/* Image Previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={url} 
                          alt={`preview-${idx}`} 
                          className="w-full h-32 object-cover rounded-lg border border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <IconX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Caption Section */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold">
                  Caption
                </label>
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  rows={4}
                  placeholder="Write your post caption here..."
                  required
                />
                <p className="text-sm text-gray-400">
                  {caption.length}/500 characters
                </p>
              </div>

              {/* Hashtags Section */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold">
                  Hashtags (optional)
                </label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={e => setHashtags(e.target.value)}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="#example #hashtag #trending"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !caption.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  'Predict Reach'
                )}
              </button>
            </form>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Results Section */}
            {result && result.prediction && result.feedback && (
              <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Prediction Results</h2>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${
                    result.model_used === 'local_ai_model' ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' :
                    result.model_used === 'groq_llama3_8b' ? 'text-green-400 bg-green-500/10 border-green-500/30' :
                    'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                  }`}>
                    {result.model_used === 'local_ai_model' ? <IconBrain className="w-4 h-4" /> :
                     result.model_used === 'groq_llama3_8b' ? <IconRobot className="w-4 h-4" /> :
                     <IconAlertTriangle className="w-4 h-4" />}
                    <span className="text-sm font-medium">
                      {result.model_used === 'local_ai_model' ? 'Local AI' : 
                       result.model_used === 'groq_llama3_8b' ? 'Groq Llama3-8B' : 
                       'Template Fallback'}
                    </span>
                  </div>
                </div>

                {/* Model Status */}
                {result.fallback_used && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <IconAlertTriangle className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Fallback Used</span>
                    </div>
                    <p className="text-yellow-300 text-sm mt-1">{result.message}</p>
                  </div>
                )}
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                    <IconTrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-2xl font-bold text-blue-400">{result.prediction.upvotes}</p>
                    <p className="text-sm text-gray-300">Upvotes</p>
                  </div>
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                    <IconChartBar className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <p className="text-2xl font-bold text-green-400">{result.prediction.karma}</p>
                    <p className="text-sm text-gray-300">Karma</p>
                  </div>
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
                    <IconTrendingUp className="w-8 h-8 mx-auto mb-2 text-red-400 rotate-180" />
                    <p className="text-2xl font-bold text-red-400">{result.prediction.downvotes}</p>
                    <p className="text-sm text-gray-300">Downvotes</p>
                  </div>
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
                    <IconMessageCircle className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <p className="text-2xl font-bold text-purple-400">{result.prediction.comments}</p>
                    <p className="text-sm text-gray-300">Comments</p>
                  </div>
                  <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 text-center">
                    <IconShare className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                    <p className="text-2xl font-bold text-orange-400">{result.prediction.shares}</p>
                    <p className="text-sm text-gray-300">Shares</p>
                  </div>
                </div>

                {/* Feedback Section */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">AI Feedback</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-blue-400 mb-2">Suggested Hashtags</h4>
                      <p className="text-gray-300">{result.feedback.suggestedHashtags?.join(', ') || 'No suggestions'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-400 mb-2">Caption Tips</h4>
                      <p className="text-gray-300">{result.feedback.captionTips}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-400 mb-2">Overall Assessment</h4>
                      <p className="text-gray-300">{result.feedback.overall}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sample Results for New Users */}
            {result && (!result.prediction || !result.feedback) && (
              <div className="mt-8 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">
                  Sample Prediction (New Account)
                </h3>
                <p className="text-gray-300 mb-4">
                  We couldn't analyze your Reddit account in detail yet. This may happen if your account is new or doesn't have enough public activity. Try posting or commenting more, then come back for more accurate predictions!
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                    <IconTrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-2xl font-bold text-blue-400">10</p>
                    <p className="text-sm text-gray-300">Upvotes</p>
                  </div>
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                    <IconChartBar className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <p className="text-2xl font-bold text-green-400">15</p>
                    <p className="text-sm text-gray-300">Karma</p>
                  </div>
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
                    <IconTrendingUp className="w-8 h-8 mx-auto mb-2 text-red-400 rotate-180" />
                    <p className="text-2xl font-bold text-red-400">1</p>
                    <p className="text-sm text-gray-300">Downvotes</p>
                  </div>
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
                    <IconMessageCircle className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <p className="text-2xl font-bold text-purple-400">2</p>
                    <p className="text-sm text-gray-300">Comments</p>
                  </div>
                  <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 text-center">
                    <IconShare className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                    <p className="text-2xl font-bold text-orange-400">1</p>
                    <p className="text-sm text-gray-300">Shares</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-400 mb-2">Sample Feedback</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><strong>Suggested Hashtags:</strong> #Welcome, #FirstPost</p>
                    <p><strong>Caption Tips:</strong> Try to ask a question or share a personal story for more engagement.</p>
                    <p><strong>Overall:</strong> Great start! Keep posting and interacting to grow your reach.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictReachPage; 