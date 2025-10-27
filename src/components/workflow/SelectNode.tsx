'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import type { Node2Data } from '@/types/workflow';

export function SelectNode({ data }: NodeProps) {
  const nodeData = data as Node2Data;
  const [taskPrompt, setTaskPrompt] = useState(nodeData.taskPrompt || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!taskPrompt.trim()) {
      alert('Please enter a task description');
      return;
    }

    if (!nodeData.crawlResults || nodeData.crawlResults.length === 0) {
      alert('Please complete Node 1 first');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/select-and-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pages: nodeData.crawlResults,
          taskPrompt: taskPrompt.trim()
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update node data with selected pages
        if (nodeData.onSelectionComplete) {
          nodeData.onSelectionComplete(result.selectedPages);
        }
      } else {
        alert(`Selection failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 min-w-[300px] shadow-lg">
      <Handle type="target" position={Position.Left} />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            2
          </div>
          <h3 className="font-semibold">AI Select & Scrape</h3>
        </div>

        <textarea
          placeholder="Describe your task (e.g., 'I want to implement user authentication with OAuth')"
          value={taskPrompt}
          onChange={(e) => setTaskPrompt(e.target.value)}
          disabled={isLoading || nodeData.status === 'completed'}
          className="w-full min-h-[80px] p-2 border rounded-md resize-none"
        />

        <Button
          onClick={handleAnalyze}
          disabled={isLoading || nodeData.status === 'completed' || !nodeData.crawlResults}
          className="w-full"
        >
          {isLoading ? 'Analyzing...' : nodeData.status === 'completed' ? 'Completed' : 'Analyze & Scrape'}
        </Button>

        {nodeData.status === 'analyzing' && (
          <p className="text-sm text-gray-600">AI is selecting relevant pages...</p>
        )}

        {nodeData.status === 'scraping' && (
          <p className="text-sm text-gray-600">Scraping selected pages...</p>
        )}

        {nodeData.status === 'completed' && nodeData.selectedCount !== undefined && (
          <div className="space-y-1">
            <p className="text-sm text-green-600">✅ Selected {nodeData.selectedCount} relevant pages</p>
            <p className="text-sm text-green-600">✅ Scraped markdown content</p>
          </div>
        )}

        {nodeData.error && (
          <p className="text-sm text-red-600">❌ {nodeData.error}</p>
        )}
      </div>

      <Handle type="source" position={Position.Right} />
    </Card>
  );
}
