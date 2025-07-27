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

export default function QuickAnalytics() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.databaseId) return;
      
      try {
        setLoading(true);
        const data = await api.getUserById(session.databaseId);
        setUserData(data);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.databaseId) {
      fetchUserData();
    }
  }, [session?.databaseId]);

  if (!session || loading) {
    return null;
  }

  if (!userData) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-8">
        <p className="text-white/80 text-sm">
          Welcome back! Your analytics will appear here after your first sign-in.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">
          Your Social Media Stats
        </h2>
        <a 
          href="/analytics" 
          className="text-blue-300 hover:text-blue-200 text-sm font-medium"
        >
          View Full Analytics →
        </a>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {api.formatNumber(userData.followers || 0)}
          </div>
          <div className="text-white/70 text-sm">Followers</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {api.formatNumber(userData.totalPosts || 0)}
          </div>
          <div className="text-white/70 text-sm">Posts</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {(userData.engagementRate || 0).toFixed(1)}%
          </div>
          <div className="text-white/70 text-sm">Engagement</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {userData.redditKarma ? api.formatNumber(userData.redditKarma) : 'N/A'}
          </div>
          <div className="text-white/70 text-sm">Karma</div>
        </div>
      </div>
      
      {userData.engagementRate && userData.engagementRate > 0 && (
        <div className="mt-4 p-3 bg-green-500/20 rounded-lg">
          <p className="text-green-200 text-sm">
            🎉 Great engagement rate! Keep creating amazing content.
          </p>
        </div>
      )}
    </div>
  );
} 