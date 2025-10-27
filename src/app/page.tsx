'use client';

import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, Background, Controls, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CrawlNode } from '@/components/workflow/CrawlNode';
import { SelectNode } from '@/components/workflow/SelectNode';
import { ZipNode } from '@/components/workflow/ZipNode';
import type { Node1Data, Node2Data, Node3Data, PageMetadata, PageContent } from '@/types/workflow';

const nodeTypes = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  crawlNode: CrawlNode as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectNode: SelectNode as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  zipNode: ZipNode as any,
};

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: 'node-1',
      type: 'crawlNode',
      position: { x: 50, y: 200 },
      data: {
        url: '',
        status: 'idle',
        onCrawlComplete: (pages: PageMetadata[]) => {
          // Update node 1 status
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === 'node-1') {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    status: 'completed',
                    crawlResults: pages,
                    totalPages: pages.length,
                  } as Node1Data,
                };
              }
              // Pass crawl results to node 2
              if (node.id === 'node-2') {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    crawlResults: pages,
                  } as Node2Data,
                };
              }
              return node;
            })
          );
        },
      } as Node1Data,
    },
    {
      id: 'node-2',
      type: 'selectNode',
      position: { x: 450, y: 200 },
      data: {
        taskPrompt: '',
        status: 'idle',
        onSelectionComplete: (pages: PageContent[]) => {
          // Update node 2 status
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === 'node-2') {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    status: 'completed',
                    selectedPages: pages,
                    selectedCount: pages.length,
                  } as Node2Data,
                };
              }
              // Pass scraped pages to node 3
              if (node.id === 'node-3') {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    scrapedPages: pages,
                    fileCount: pages.length,
                  } as Node3Data,
                };
              }
              return node;
            })
          );
        },
      } as Node2Data,
    },
    {
      id: 'node-3',
      type: 'zipNode',
      position: { x: 850, y: 200 },
      data: {
        status: 'idle',
        onZipGenerated: () => {
          // Update node 3 status
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === 'node-3') {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    status: 'ready',
                  } as Node3Data,
                };
              }
              return node;
            })
          );
        },
      } as Node3Data,
    },
  ]);

  const [edges, setEdges] = useState<Edge[]>([
    { id: 'edge-1-2', source: 'node-1', target: 'node-2', animated: true },
    { id: 'edge-2-3', source: 'node-2', target: 'node-3', animated: true },
  ]);

  const onNodesChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }} className="bg-gray-50">
      <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Documentation Workflow</h1>
        <p className="text-sm text-gray-600">
          AI-powered documentation discovery and packaging for coding agents
        </p>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}