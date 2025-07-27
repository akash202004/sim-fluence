"use client";

import React, { useState } from 'react';
import GroqService from './groqService';

export default function TestGroqComponent() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testGroqConnection = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      const groqService = new GroqService();
      
      const result = await groqService.generateCaptionAndHashtags({
        imageDescription: "A beautiful sunset over the ocean with palm trees",
        platform: "instagram",
        tone: "casual"
      });

      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Test Groq AI Connection</h3>
      
      <button
        onClick={testGroqConnection}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test Connection'}
      </button>

      {testResult && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Result:</h4>
          <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-auto text-sm">
            {testResult}
          </pre>
        </div>
      )}
    </div>
  );
} 