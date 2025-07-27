"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SimulationCharts } from "../components/SimulationCharts";


interface SimulationSectionProps {
  userId: string;
}

// Define types based on Prisma schema
type Platform = "FACEBOOK" | "INSTAGRAM" | "TWITTER" | "LINKEDIN";
type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

interface SimulationData {
  title: string;
  content: string;
  platform: Platform;
  files: File[];
}

interface SimulationResult {
  id: string;
  title: string;
  content: string;
  status: Status;
  platform: Platform;
  impressions: number;
  likesEstimate: number;
  commentsEstimate: number;
  createdAt: string;
  agentReactions: {
    agentName: string;
    action: string;
    reason: string;
    sentiment: string;
  }[];
  summary?: {
    summaryText: string;
    toneCloud: any;
    toneBreakdown: any;
    sectionFeedback: any;
    engagementData: any;
    audienceMatch: string;
    feedbackScore: number;
  };
  postSuggestions: {
    id: string;
    suggestionText: string;
    applied: boolean;
  }[];
}

export function SimulationSection({ userId }: SimulationSectionProps) {
  const [simulationData, setSimulationData] = useState<SimulationData>({
    title: "",
    content: "",
    platform: "INSTAGRAM",
    files: [],
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);
  const [pastSimulations, setPastSimulations] = useState<SimulationResult[]>([]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSimulationData({
      ...simulationData,
      content: e.target.value,
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSimulationData({
      ...simulationData,
      title: e.target.value,
    });
  };

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSimulationData({
      ...simulationData,
      platform: e.target.value as Platform,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Limit file size to prevent memory issues (10MB limit)
      const validFiles = newFiles.filter(file => file.size <= 10 * 1024 * 1024);
      
      if (validFiles.length !== newFiles.length) {
        // Optional: Add error handling for files that are too large
        console.warn("Some files were too large and were not added");
      }
      
      setSimulationData({
        ...simulationData,
        files: [...simulationData.files, ...validFiles],
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setSimulationData({
      ...simulationData,
      files: simulationData.files.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    try {
      // Inline API call since api.createSimulation does not exist
      const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${BACKEND_URL}/api/v1/simulation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: simulationData.content,
          status: "COMPLETED",
          userId,
          platform: simulationData.platform,
        }),
      });
      if (!response.ok) throw new Error("Failed to create simulation");
      const result = await response.json();
      setSimulationResults({
        id: result.id,
        title: simulationData.title,
        content: result.content,
        status: result.status,
        platform: result.platform,
        impressions: Math.floor(Math.random() * 10000),
        likesEstimate: Math.floor(Math.random() * 1000),
        commentsEstimate: Math.floor(Math.random() * 200),
        createdAt: result.createdAt,
        agentReactions: [],
        summary: undefined,
        postSuggestions: [],
      });
      setPastSimulations(prev => [{
        id: result.id,
        title: simulationData.title,
        content: result.content,
        status: result.status,
        platform: result.platform,
        impressions: Math.floor(Math.random() * 10000),
        likesEstimate: Math.floor(Math.random() * 1000),
        commentsEstimate: Math.floor(Math.random() * 200),
        createdAt: result.createdAt,
        agentReactions: [],
        summary: undefined,
        postSuggestions: [],
      }, ...prev]);
    } catch {
      alert("Failed to create simulation");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Prepare chart data
  const toneData = simulationResults?.summary?.toneCloud ? 
    Object.entries(simulationResults.summary.toneCloud).map(([name, value]) => ({ name, value: Number(value) })) : [];
  
  const toneBreakdownData = simulationResults?.summary?.toneBreakdown ? 
    Object.entries(simulationResults.summary.toneBreakdown).map(([name, value]) => ({ name, value: Number(value) })) : [];
  
  const engagementData = simulationResults?.summary?.engagementData ? 
    Object.entries(simulationResults.summary.engagementData).map(([name, value]) => ({ name, value: Number(value) })) : [];
  
  const timeSeriesData = [
    { name: 'Day 1', impressions: 1200, engagement: 300 },
    { name: 'Day 2', impressions: 2400, engagement: 450 },
    { name: 'Day 3', impressions: 1800, engagement: 380 },
    { name: 'Day 4', impressions: 3200, engagement: 520 },
    { name: 'Day 5', impressions: 2800, engagement: 490 },
    { name: 'Day 6', impressions: 3600, engagement: 580 },
    { name: 'Day 7', impressions: 4000, engagement: 620 },
  ];

  const demographicData = [
    { subject: '18-24', A: 120, B: 110, fullMark: 150 },
    { subject: '25-34', A: 98, B: 130, fullMark: 150 },
    { subject: '35-44', A: 86, B: 130, fullMark: 150 },
    { subject: '45-54', A: 99, B: 100, fullMark: 150 },
    { subject: '55-64', A: 85, B: 90, fullMark: 150 },
    { subject: '65+', A: 65, B: 85, fullMark: 150 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      <div className="flex flex-col gap-8">
        {/* Create Simulation Section */}
        <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">
              Create Your Post Simulation
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Upload your images, write your caption, and let AI predict how your post will perform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                📸 Upload Your Media
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,video/*"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <span className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-2">
                    Click to upload or drag and drop
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Images, videos up to 10MB each
                  </p>
                </label>
              </div>

              {/* File Previews */}
              {simulationData.files.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Uploaded Media ({simulationData.files.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {simulationData.files.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="h-32 w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                          {file.type.startsWith("image/") ? (
                            <Image
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs text-gray-500">Video</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Remove file"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <p className="mt-1 text-xs text-gray-500 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                📱 Choose Platform
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-white text-lg"
                value={simulationData.platform}
                onChange={handlePlatformChange}
                required
              >
                <option value="INSTAGRAM">Instagram</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="TWITTER">Twitter</option>
                <option value="LINKEDIN">LinkedIn</option>
              </select>
            </div>

            {/* Caption/Content Section */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                ✍️ Write Your Caption
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-white text-lg"
                  placeholder="Add a catchy title for your post..."
                  value={simulationData.title}
                  onChange={handleTitleChange}
                  required
                />
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-white text-lg"
                  rows={6}
                  placeholder="Write your post caption here... Include hashtags, mentions, and any relevant details..."
                  value={simulationData.content}
                  onChange={handleContentChange}
                  required
                />
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>Tip: Include relevant hashtags and mentions for better reach</span>
                  <span>{simulationData.content.length} characters</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isAnalyzing || !simulationData.title || !simulationData.content}
                className={cn(
                  "w-full py-4 px-6 rounded-lg text-white font-semibold text-lg transition-all duration-200",
                  isAnalyzing || !simulationData.title || !simulationData.content
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg"
                )}
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Running AI Simulation...
                  </div>
                ) : (
                  "🚀 Run AI Simulation"
                )}
              </button>
              {(!simulationData.title || !simulationData.content) && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Please add a title and caption to run the simulation
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Simulation Results Section */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
            Simulation Results
          </h2>

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Running simulation...
              </p>
            </div>
          ) : simulationResults ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  Engagement Metrics
                </h3>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Impressions</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{simulationResults.impressions.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Likes</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{simulationResults.likesEstimate.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Comments</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{simulationResults.commentsEstimate.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Charts Component */}
              
              <SimulationCharts 
                toneData={toneData}
                toneBreakdownData={toneBreakdownData}
                engagementData={engagementData}
                timeSeriesData={timeSeriesData}
                demographicData={demographicData}
              />

              {simulationResults.summary && (
                <>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      Summary
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      {simulationResults.summary.summaryText}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      Audience Match
                    </h3>
                    <p className={cn(
                      "mt-2 inline-block px-3 py-1 rounded-full text-sm",
                      simulationResults.summary.audienceMatch === "High" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                      simulationResults.summary.audienceMatch === "Low" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    )}>
                      {simulationResults.summary.audienceMatch}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      Feedback Score
                    </h3>
                    <div className="flex items-center mt-2">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-6 h-6 rounded-full mx-1",
                            i < Math.floor(simulationResults.summary?.feedbackScore || 0)
                              ? "bg-blue-500"
                              : "bg-gray-300 dark:bg-gray-700"
                          )}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {simulationResults.summary.feedbackScore}/10
                    </p>
                  </div>
                </>
              )}

              {simulationResults.postSuggestions.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Improvement Suggestions
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {simulationResults.postSuggestions.map((suggestion) => (
                      <li key={suggestion.id} className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 text-blue-500">•</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">{suggestion.suggestionText}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <svg
                className="w-16 h-16 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Run a simulation to see results
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Past Simulations Section */}
      <div className="mt-12 bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-6 text-black dark:text-white">
          Past Simulations
        </h2>

        {pastSimulations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-neutral-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Platform</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Impressions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-gray-800">
                {pastSimulations.map((simulation) => (
                  <tr key={simulation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(simulation.createdAt).toLocaleDateString('en-US')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div className="truncate max-w-xs">
                        {simulation.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {simulation.platform}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        simulation.status === "COMPLETED" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        simulation.status === "FAILED" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                        simulation.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      )}>
                        {simulation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {simulation.impressions.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No past simulations found. Run your first simulation to see results here.
          </div>
        )}
      </div>
    </div>
);
}
