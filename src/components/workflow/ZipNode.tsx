'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import type { Node3Data } from '@/types/workflow';

export function ZipNode({ data }: NodeProps) {
  const nodeData = data as Node3Data;
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!nodeData.scrapedPages || nodeData.scrapedPages.length === 0) {
      alert('Please complete Node 2 first');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pages: nodeData.scrapedPages
        })
      });

      if (response.ok) {
        // Download the zip file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `documentation-${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Update node status
        if (nodeData.onZipGenerated) {
          nodeData.onZipGenerated();
        }
      } else {
        const error = await response.json();
        alert(`Download failed: ${error.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-4 min-w-[300px] shadow-lg">
      <Handle type="target" position={Position.Left} />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
            3
          </div>
          <h3 className="font-semibold">Generate Package</h3>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          {nodeData.fileCount !== undefined ? (
            <p>Ready: {nodeData.fileCount} markdown files</p>
          ) : (
            <p>Waiting for pages to be selected...</p>
          )}
        </div>

        <Button
          onClick={handleDownload}
          disabled={isGenerating || !nodeData.scrapedPages || nodeData.scrapedPages.length === 0}
          className="w-full"
        >
          {isGenerating ? 'Generating...' : 'Download Zip'}
        </Button>

        {nodeData.status === 'generating' && (
          <p className="text-sm text-gray-600">Creating zip file...</p>
        )}

        {nodeData.status === 'ready' && (
          <p className="text-sm text-green-600">✅ Download complete!</p>
        )}

        {nodeData.error && (
          <p className="text-sm text-red-600">❌ {nodeData.error}</p>
        )}
      </div>
    </Card>
  );
}
