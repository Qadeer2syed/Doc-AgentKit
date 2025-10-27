'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import type { Node1Data } from '@/types/workflow';

export function CrawlNode({ data }: NodeProps) {
  const nodeData = data as Node1Data;
  const [url, setUrl] = useState(nodeData.url || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleCrawl = async () => {
    if (!url.trim()) {
      alert('Please enter a URL');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const result = await response.json();

      if (result.success) {
        // Update node data with crawl results
        if (nodeData.onCrawlComplete) {
          nodeData.onCrawlComplete(result.pages);
        }
      } else {
        alert(`Crawl failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 min-w-[300px] shadow-lg">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            1
          </div>
          <h3 className="font-semibold">Crawl Documentation</h3>
        </div>

        <Input
          placeholder="Enter docs URL (e.g., https://docs.example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading || nodeData.status === 'completed'}
        />

        <Button
          onClick={handleCrawl}
          disabled={isLoading || nodeData.status === 'completed'}
          className="w-full"
        >
          {isLoading ? 'Crawling...' : nodeData.status === 'completed' ? 'Completed' : 'Start Crawl'}
        </Button>

        {nodeData.status === 'crawling' && (
          <p className="text-sm text-gray-600">Discovering pages...</p>
        )}

        {nodeData.status === 'completed' && nodeData.totalPages !== undefined && (
          <p className="text-sm text-green-600">✅ Found {nodeData.totalPages} pages</p>
        )}

        {nodeData.error && (
          <p className="text-sm text-red-600">❌ {nodeData.error}</p>
        )}
      </div>

      <Handle type="source" position={Position.Right} />
    </Card>
  );
}
