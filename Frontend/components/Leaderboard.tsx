"use client";

import { useState, useEffect } from 'react';
import { api, UserData } from '@/lib/api';
import Image from 'next/image';

interface LeaderboardProps {
  sortBy?: 'followers' | 'engagementRate' | 'averagePostImpressions';
  limit?: number;
}

export default function Leaderboard({ 
  sortBy = 'followers', 
  limit = 10 
}: LeaderboardProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await api.getLeaderboard({
          sortBy,
          order: 'desc',
          limit,
        });
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [sortBy, limit]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
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

  const getSortByLabel = (sortBy: string) => {
    switch (sortBy) {
      case 'followers':
        return 'Followers';
      case 'engagementRate':
        return 'Engagement Rate';
      case 'averagePostImpressions':
        return 'Avg. Impressions';
      default:
        return 'Followers';
    }
  };

  const getMetricValue = (user: UserData, sortBy: string) => {
    switch (sortBy) {
      case 'followers':
        return user.followers || 0;
      case 'engagementRate':
        return user.engagementRate || 0;
      case 'averagePostImpressions':
        return user.averagePostImpressions || 0;
      default:
        return user.followers || 0;
    }
  };

  const formatMetricValue = (value: number, sortBy: string) => {
    if (sortBy === 'engagementRate') {
      return `${value.toFixed(1)}%`;
    }
    return api.formatNumber(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Top {getSortByLabel(sortBy)} Leaderboard
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => window.location.href = '?sortBy=followers'}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              sortBy === 'followers'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Followers
          </button>
          <button
            onClick={() => window.location.href = '?sortBy=engagementRate'}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              sortBy === 'engagementRate'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Engagement
          </button>
          <button
            onClick={() => window.location.href = '?sortBy=averagePostImpressions'}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              sortBy === 'averagePostImpressions'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Impressions
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {users.map((user, index) => (
          <div
            key={user.id}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              index === 0
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-yellow-300'
                : index === 1
                ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white border-gray-200'
                : index === 2
                ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white border-orange-300'
                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                index === 0
                  ? 'bg-yellow-600 text-white'
                  : index === 1
                  ? 'bg-gray-600 text-white'
                  : index === 2
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}>
                {index + 1}
              </div>
              <div className="flex items-center space-x-3">
                {user.profileImageUrl && (
                  <Image
                    src={user.profileImageUrl}
                    alt={user.name || user.redditUsername || 'User'}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                <div>
                  <p className={`font-semibold ${
                    index < 3 ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {user.name || user.redditUsername || 'Anonymous User'}
                  </p>
                  <p className={`text-sm ${
                    index < 3 ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {user.followers ? `${api.formatNumber(user.followers)} followers` : 'New user'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-lg font-bold ${
                index < 3 ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}>
                {formatMetricValue(getMetricValue(user, sortBy), sortBy)}
              </p>
              <p className={`text-sm ${
                index < 3 ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {getSortByLabel(sortBy)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No users found with {getSortByLabel(sortBy).toLowerCase()} data.
          </p>
        </div>
      )}
    </div>
  );
} 