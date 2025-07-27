"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

interface ChartProps {
  toneData: { name: string; value: number }[];
  toneBreakdownData: { name: string; value: number }[];
  engagementData: { name: string; value: number }[];
  timeSeriesData: { name: string; impressions: number; engagement: number }[];
  demographicData: { subject: string; A: number; B: number; fullMark: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function SimulationCharts({
  toneData,
  toneBreakdownData,
  engagementData,
  timeSeriesData,
  demographicData
}: ChartProps) {
  const tooltipStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '8px',
    border: 'none',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div className="space-y-8">
      {/* Engagement Bar Chart */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
          Engagement Breakdown
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={engagementData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tone Distribution Pie Chart */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
          Tone Distribution
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={toneData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1500}
                animationBegin={300}
              >
                {toneData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Percentage']}
                contentStyle={tooltipStyle} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projected Growth Line Chart */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
          Projected Growth Over Time
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={timeSeriesData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="impressions" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
                animationDuration={1500}
              />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="#82ca9d" 
                strokeWidth={2}
                animationDuration={1500}
                animationBegin={300}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Demographic Radar Chart */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
          Audience Demographics
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={demographicData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar 
                name="Your Post" 
                dataKey="A" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.6}
                animationDuration={1500}
              />
              <Radar 
                name="Average" 
                dataKey="B" 
                stroke="#82ca9d" 
                fill="#82ca9d" 
                fillOpacity={0.6}
                animationDuration={1500}
                animationBegin={300}
              />
              <Legend />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Content Type Area Chart */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
          Content Type Analysis
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={toneBreakdownData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={tooltipStyle} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                fill="url(#colorValue)" 
                animationDuration={1500}
              />
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}