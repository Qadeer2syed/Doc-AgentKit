// Phase 1: Lightweight metadata from crawl
export interface PageMetadata {
  url: string;
  title: string;
  description: string;
}

// Phase 2: Full content after scraping
export interface PageContent {
  url: string;
  title: string;
  markdown: string;
}

// API Response types
export interface CrawlResponse {
  success: boolean;
  pages: PageMetadata[];
  totalPages: number;
}

export interface SelectionResponse {
  success: boolean;
  selectedPages: PageContent[];
  selectedCount: number;
}

export interface ZipResponse {
  success: boolean;
  downloadUrl: string;
  fileCount: number;
}

// ReactFlow Node Data types
export interface Node1Data extends Record<string, unknown> {
  url: string;
  status: 'idle' | 'crawling' | 'completed' | 'error';
  crawlResults?: PageMetadata[];
  totalPages?: number;
  error?: string;
  onCrawlComplete?: (pages: PageMetadata[]) => void;
}

export interface Node2Data extends Record<string, unknown> {
  taskPrompt: string;
  status: 'idle' | 'analyzing' | 'scraping' | 'completed' | 'error';
  crawlResults?: PageMetadata[];
  selectedPages?: PageContent[];
  selectedCount?: number;
  error?: string;
  onSelectionComplete?: (pages: PageContent[]) => void;
}

export interface Node3Data extends Record<string, unknown> {
  status: 'idle' | 'generating' | 'ready' | 'error';
  scrapedPages?: PageContent[];
  fileCount?: number;
  downloadUrl?: string;
  error?: string;
  onZipGenerated?: () => void;
}
