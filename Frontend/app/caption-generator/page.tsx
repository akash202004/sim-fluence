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
  IconBrain,
  IconRobot,
  IconCheck,
  IconAlertTriangle,
  IconInfoCircle,
  IconCopy,
  IconRefresh
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

const CaptionGeneratorPage = () => {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('reddit');
  const [tone, setTone] = useState('casual');
  const [length, setLength] = useState('medium');
  const [includeHashtags, setIncludeHashtags] = useState(false);
  const [targetAudience, setTargetAudience] = useState('general');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          platform,
          tone,
          length,
          include_hashtags: includeHashtags,
          target_audience: targetAudience
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate caption');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
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

  const getModelIcon = (modelUsed: string) => {
    switch (modelUsed) {
      case 'local_ai_model':
        return <IconBrain className="w-5 h-5 text-blue-400" />;
      case 'groq_llama3_8b':
        return <IconRobot className="w-5 h-5 text-green-400" />;
      case 'template_fallback':
        return <IconAlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <IconInfoCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getModelColor = (modelUsed: string) => {
    switch (modelUsed) {
      case 'local_ai_model':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'groq_llama3_8b':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'template_fallback':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

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
              AI Caption Generator
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Generate engaging captions using our AI models with intelligent fallback
            </p>
          </div>

          {/* Form Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Prompt Input */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold">
                  Content Description
                </label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  rows={4}
                  placeholder="Describe your content or what you want to post about..."
                  required
                />
              </div>

              {/* Platform Selection */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-lg font-semibold">Platform</label>
                  <select
                    value={platform}
                    onChange={e => setPlatform(e.target.value)}
                    className="w-full bg-white/10 border border-gray-600 rounded-lg p-4 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="reddit">Reddit</option>
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-lg font-semibold">Tone</label>
                  <select
                    value={tone}
                    onChange={e => setTone(e.target.value)}
                    className="w-full bg-white/10 border border-gray-600 rounded-lg p-4 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="casual">Casual</option>
                    <option value="professional">Professional</option>
                    <option value="funny">Funny</option>
                    <option value="inspirational">Inspirational</option>
                    <option value="educational">Educational</option>
                  </select>
                </div>
              </div>

              {/* Additional Options */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="block text-lg font-semibold">Length</label>
                  <select
                    value={length}
                    onChange={e => setLength(e.target.value)}
                    className="w-full bg-white/10 border border-gray-600 rounded-lg p-4 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-lg font-semibold">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={e => setTargetAudience(e.target.value)}
                    className="w-full bg-white/10 border border-gray-600 rounded-lg p-4 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="general">General</option>
                    <option value="professionals">Professionals</option>
                    <option value="students">Students</option>
                    <option value="creators">Content Creators</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-lg font-semibold">Options</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="includeHashtags"
                      checked={includeHashtags}
                      onChange={e => setIncludeHashtags(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="includeHashtags" className="text-sm">
                      Include Hashtags
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Caption...
                  </div>
                ) : (
                  'Generate Caption'
                )}
              </button>
            </form>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          {result && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Generated Caption</h2>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getModelColor(result.model_used)}`}>
                  {getModelIcon(result.model_used)}
                  <span className="text-sm font-medium">
                    {result.model_used === 'local_ai_model' ? 'Local AI' : 
                     result.model_used === 'groq_llama3_8b' ? 'Groq Llama3-8B' : 
                     'Template Fallback'}
                  </span>
                </div>
              </div>

              {/* Model Status */}
              {result.fallback_used && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <IconAlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">Fallback Used</span>
                  </div>
                  <p className="text-yellow-300 text-sm mt-1">{result.message}</p>
                </div>
              )}

              {/* Caption */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Generated Caption</label>
                  <div className="relative">
                    <textarea
                      value={result.caption}
                      readOnly
                      className="w-full bg-white/10 border border-gray-600 rounded-lg p-4 text-white resize-none"
                      rows={3}
                    />
                    <button
                      onClick={() => copyToClipboard(result.caption)}
                      className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                      title="Copy to clipboard"
                    >
                      <IconCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Hashtags */}
                {result.hashtags && result.hashtags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Hashtags</label>
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags.map((hashtag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm"
                        >
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {result.suggestions && result.suggestions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Suggestions</label>
                    <ul className="space-y-2">
                      {result.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <IconCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Confidence Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confidence Score</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${result.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-300">{Math.round(result.confidence * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Regenerate Button */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <IconRefresh className="w-4 h-4" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaptionGeneratorPage;