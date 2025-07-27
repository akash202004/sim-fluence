"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { api, UserData } from '@/lib/api';

// Extend the Session type to include databaseId
interface ExtendedSession {
  databaseId?: string;
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
}

interface UserAnalyticsProps {
  userId?: string;
}

export default function UserAnalytics({ userId }: UserAnalyticsProps) {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const targetUserId = userId || session?.databaseId;
        
        if (!targetUserId) {
          setError('No user ID available');
          return;
        }

        const data = await api.getUserById(targetUserId);
        setUserData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    if (session?.databaseId || userId) {
      fetchUserData();
    }
  }, [session?.databaseId, userId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-600">No user data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Social Media Analytics
        </h2>
        {userData.verified && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Verified
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Followers */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Followers</p>
              <p className="text-2xl font-bold">
                {api.formatNumber(userData.followers || 0)}
              </p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        {/* Following */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Following</p>
              <p className="text-2xl font-bold">
                {api.formatNumber(userData.following || 0)}
              </p>
            </div>
            <div className="text-3xl">🔗</div>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Engagement Rate</p>
              <p className="text-2xl font-bold">
                {(userData.engagementRate || 0).toFixed(1)}%
              </p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>

        {/* Total Posts */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Posts</p>
              <p className="text-2xl font-bold">
                {api.formatNumber(userData.totalPosts || 0)}
              </p>
            </div>
            <div className="text-3xl">📝</div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Post Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Avg. Impressions</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {api.formatNumber(userData.averagePostImpressions || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Avg. Likes</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {api.formatNumber(userData.averageLikes || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Avg. Comments</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {api.formatNumber(userData.averageComments || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Avg. Shares</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {api.formatNumber(userData.averageShares || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account Info
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Account Age</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {userData.accountAge ? `${userData.accountAge} days` : 'N/A'}
              </span>
            </div>
            {userData.redditKarma && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Reddit Karma</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {api.formatNumber(userData.redditKarma)}
                </span>
              </div>
            )}
            {userData.redditAccountAge && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Reddit Account Age</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {userData.redditAccountAge} days
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Last Active</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {userData.lastActive 
                  ? new Date(userData.lastActive).toLocaleDateString()
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Insights */}
      {userData.engagementRate && userData.engagementRate > 0 && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Engagement Insights
          </h3>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Your engagement rate of {(userData.engagementRate).toFixed(1)}% is 
            {userData.engagementRate > 5 ? ' excellent' : 
             userData.engagementRate > 2 ? ' good' : ' below average'} 
            compared to industry standards. Keep creating engaging content!
          </p>
        </div>
      )}
    </div>
  );
} 