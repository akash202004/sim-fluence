"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, TrendingUp, Eye, Trash2, Search } from "lucide-react";

interface Simulation {
  id: string;
  content: string;
  platform: "FACEBOOK" | "INSTAGRAM" | "TWITTER" | "LINKEDIN";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  createdAt: string;
  summary?: {
    feedbackScore: number;
    summaryText: string;
  };
  agentReactions: Array<{
    agentName: string;
    action: string;
    sentiment: string;
  }>;
}

export default function PastSimulations() {
  const { data: session } = useSession();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (session?.user) {
      fetchPastSimulations();
    }
  }, [session]);

  const fetchPastSimulations = async () => {
    try {
      setLoading(true);
      // For now, we'll fetch all simulations since we need to implement user ID mapping
      // In a real app, you'd get the user ID from the session
      const response = await fetch(`/api/simulations`);
      if (!response.ok) {
        throw new Error("Failed to fetch simulations");
      }
      const data = await response.json();
      setSimulations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch simulations");
    } finally {
      setLoading(false);
    }
  };

  const deleteSimulation = async (id: string) => {
    try {
      const response = await fetch(`/api/simulations/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete simulation");
      }
      setSimulations(simulations.filter(sim => sim.id !== id));
      if (selectedSimulation?.id === id) {
        setSelectedSimulation(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete simulation");
    }
  };

  const filteredSimulations = simulations.filter(simulation => {
    const matchesPlatform = filterPlatform === "all" || simulation.platform === filterPlatform;
    const matchesStatus = filterStatus === "all" || simulation.status === filterStatus;
    const matchesSearch = simulation.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesPlatform && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-800";
      case "PENDING": return "bg-blue-100 text-blue-800";
      case "FAILED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "FACEBOOK": return "📘";
      case "INSTAGRAM": return "📷";
      case "TWITTER": return "🐦";
      case "LINKEDIN": return "💼";
      default: return "📱";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading past simulations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={fetchPastSimulations}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Past Simulations
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            View and manage your previous content simulations
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {simulations.length} simulations
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search simulations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Platform Filter */}
          <div className="sm:w-48">
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Platforms</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="TWITTER">Twitter</option>
              <option value="LINKEDIN">LinkedIn</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Simulations List */}
      <div className="space-y-4">
        {filteredSimulations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No simulations found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {simulations.length === 0 
                ? "You haven't created any simulations yet." 
                : "No simulations match your current filters."
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSimulations.map((simulation) => (
              <motion.div
                key={simulation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{getPlatformIcon(simulation.platform)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {simulation.platform.charAt(0) + simulation.platform.slice(1).toLowerCase()} Simulation
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(simulation.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                      {simulation.content}
                    </p>

                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(simulation.status)}`}>
                        {simulation.status.replace("_", " ")}
                      </span>
                      
                      {simulation.summary?.feedbackScore && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <TrendingUp className="w-4 h-4" />
                          <span>Score: {simulation.summary.feedbackScore}/10</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setSelectedSimulation(simulation)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSimulation(simulation.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Simulation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Simulation Details Modal */}
      <AnimatePresence>
        {selectedSimulation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedSimulation(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getPlatformIcon(selectedSimulation.platform)}</span>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedSimulation.platform.charAt(0) + selectedSimulation.platform.slice(1).toLowerCase()} Simulation
                      </h2>
                      <p className="text-sm text-gray-500">
                        {formatDate(selectedSimulation.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSimulation(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Content */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Content</h3>
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      {selectedSimulation.content}
                    </p>
                  </div>

                  {/* Status and Score */}
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSimulation.status)}`}>
                      {selectedSimulation.status.replace("_", " ")}
                    </span>
                    {selectedSimulation.summary?.feedbackScore && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Score: {selectedSimulation.summary.feedbackScore}/10</span>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {selectedSimulation.summary?.summaryText && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Summary</h3>
                      <p className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        {selectedSimulation.summary.summaryText}
                      </p>
                    </div>
                  )}

                  {/* Agent Reactions */}
                  {selectedSimulation.agentReactions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Agent Reactions</h3>
                      <div className="space-y-3">
                        {selectedSimulation.agentReactions.map((reaction, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {reaction.agentName}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                reaction.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                                reaction.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {reaction.sentiment}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {reaction.action}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 