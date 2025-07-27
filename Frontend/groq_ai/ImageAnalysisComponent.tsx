"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GroqService from './groqService';
import { useSession } from 'next-auth/react';

interface GroqResponse {
  caption: string;
  hashtags: string[];
  engagement_tips: string[];
}

interface EngagementAnalysis {
  engagement_score: number;
  virality_potential: string;
  best_posting_time: string;
  audience_recommendations: string[];
}

export default function ImageAnalysisComponent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [platform, setPlatform] = useState<'instagram' | 'twitter' | 'reddit' | 'linkedin'>('instagram');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'funny' | 'inspirational'>('casual');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [groqResponse, setGroqResponse] = useState<GroqResponse | null>(null);
  const [engagementAnalysis, setEngagementAnalysis] = useState<EngagementAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession() as { data: { databaseId?: string } | null };
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !imageDescription.trim()) {
      setError('Please select an image and provide a description');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const groqService = new GroqService();
      
      // Generate caption and hashtags
      const captionResponse = await groqService.generateCaptionAndHashtags({
        imageDescription,
        platform,
        targetAudience,
        tone
      });
      
      setGroqResponse(captionResponse);

      // Analyze engagement potential
      const engagementResponse = await groqService.analyzeImageEngagement(imageDescription, platform);
      setEngagementAnalysis(engagementResponse);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const resetForm = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setImageDescription('');
    setGroqResponse(null);
    setEngagementAnalysis(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper to upload image to Cloudinary (if not already uploaded)
  async function uploadImageToCloudinary(file: File): Promise<string | null> {
    // You may already have a Cloudinary upload endpoint; this is a placeholder
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // Change to your preset
    const res = await fetch('https://api.cloudinary.com/v1_1/your-cloud/image/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.secure_url as string;
  }

  // Automatically save simulation to DB after analysis
  React.useEffect(() => {
    const saveSimulation = async () => {
      if (!groqResponse || !engagementAnalysis || !session?.databaseId || saveStatus !== 'idle') return;
      setSaveStatus('saving');
      let imageUrl = imagePreview;
      if (selectedFile && imagePreview?.startsWith('data:')) {
        imageUrl = await uploadImageToCloudinary(selectedFile);
      }
      try {
        const res = await fetch('/api/simulations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: groqResponse.caption,
            postUrl: imageUrl,
            status: 'COMPLETED',
            userId: session.databaseId,
            platform: platform.toUpperCase(),
            hashtags: groqResponse.hashtags,
            engagementTips: groqResponse.engagement_tips,
            engagementScore: engagementAnalysis.engagement_score,
            viralityPotential: engagementAnalysis.virality_potential,
            bestPostingTime: engagementAnalysis.best_posting_time,
            audienceRecommendations: engagementAnalysis.audience_recommendations,
            imageDescription,
          }),
        });
        if (!res.ok) throw new Error('Failed to save simulation');
        setSaveStatus('success');
      } catch (err) {
        setSaveStatus('error');
      }
    };
    saveSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groqResponse, engagementAnalysis, session?.databaseId]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        AI-Powered Image Analysis
      </h2>

      {/* File Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload Image
        </label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Choose Image
          </button>
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Image Preview
          </label>
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-full h-64 object-cover rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Analysis Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Image Description
          </label>
          <textarea
            value={imageDescription}
            onChange={(e) => setImageDescription(e.target.value)}
            placeholder="Describe what's in your image..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            rows={4}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
              <option value="reddit">Reddit</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="casual">Casual</option>
              <option value="professional">Professional</option>
              <option value="funny">Funny</option>
              <option value="inspirational">Inspirational</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Audience (Optional)
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., tech professionals, fitness enthusiasts..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !selectedFile || !imageDescription.trim()}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
        </button>
        <button
          onClick={resetForm}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {(groqResponse || engagementAnalysis) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Caption and Hashtags */}
            {groqResponse && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                  AI-Generated Caption & Hashtags
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Caption
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="flex-1 p-3 bg-white dark:bg-gray-700 rounded-lg border">
                        {groqResponse.caption}
                      </p>
                      <button
                        onClick={() => copyToClipboard(groqResponse.caption)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Hashtags
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="flex-1 p-3 bg-white dark:bg-gray-700 rounded-lg border">
                        {groqResponse.hashtags.join(' ')}
                      </p>
                      <button
                        onClick={() => copyToClipboard(groqResponse.hashtags.join(' '))}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Engagement Tips
                    </label>
                    <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                      {groqResponse.engagement_tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Engagement Analysis */}
            {engagementAnalysis && (
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                  Engagement Analysis
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                      Engagement Score
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white dark:bg-gray-700 rounded-lg p-3">
                        <span className="text-2xl font-bold text-green-600">
                          {engagementAnalysis.engagement_score}/10
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                      Virality Potential
                    </label>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                      <span className="text-lg font-semibold text-green-600 capitalize">
                        {engagementAnalysis.virality_potential}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                      Best Posting Time
                    </label>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                      <span className="text-green-600">
                        {engagementAnalysis.best_posting_time}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                      Audience Recommendations
                    </label>
                    <ul className="list-disc list-inside space-y-1 text-green-800 dark:text-green-200">
                      {engagementAnalysis.audience_recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {/* Save status message */}
            {saveStatus === 'saving' && (
              <div className="text-orange-600">Saving to your history...</div>
            )}
            {saveStatus === 'success' && (
              <div className="text-green-600">Saved to your Past Simulations!</div>
            )}
            {saveStatus === 'error' && (
              <div className="text-red-600">Failed to save simulation. Please try again.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 