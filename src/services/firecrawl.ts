import Firecrawl from '@mendable/firecrawl-js';
import { env } from '@/config/env';
import { Logger } from '@/utils/logger';
import type { PageMetadata, PageContent } from '@/types/workflow';

const logger = new Logger('Service:Firecrawl');

// Initialize Firecrawl client
const getFirecrawlClient = () => {
  return new Firecrawl({ apiKey: env.FIRECRAWL_API_KEY });
};

/**
 * Phase 1: Crawl documentation site and extract lightweight metadata
 * Returns only URL, title, and description for each page (no full content)
 */
export async function crawlForMetadata(url: string): Promise<PageMetadata[]> {
  logger.info('Starting lightweight metadata crawl', { url });

  const firecrawl = getFirecrawlClient();

  try {
    // Crawl with custom JSON schema to extract only metadata
    const crawlResponse = await firecrawl.crawl(url, {
      limit: 100, // Maximum pages to crawl
      scrapeOptions: {
        formats: [{
          type: 'json',
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              url: { type: 'string' }
            }
          }
        }],
        onlyMainContent: true, // Skip navigation, footer, etc.
      }
    });

    logger.info('Crawl completed', {
      total: crawlResponse.data?.length || 0,
      status: crawlResponse.status
    });

    // Transform response to PageMetadata format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pages: PageMetadata[] = (crawlResponse.data || []).map((page: any) => ({
      url: page.metadata?.sourceURL || page.url || '',
      title: page.json?.title || page.metadata?.title || 'Untitled',
      description: page.json?.description || page.metadata?.description || '',
    }));

    logger.info('Metadata extraction complete', { pageCount: pages.length });
    return pages;

  } catch (error) {
    logger.error('Crawl failed', { error });
    throw new Error(`Failed to crawl ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Phase 3: Scrape specific URLs for full markdown content
 * Used after LLM selects relevant pages
 * Uses batch scraping for better performance and reliability
 */
export async function scrapePages(urls: string[]): Promise<PageContent[]> {
  logger.info('Starting batch scraping', { count: urls.length });

  const firecrawl = getFirecrawlClient();

  try {
    // Use batch scraping for better performance
    const batchResult = await firecrawl.batchScrape(urls, {
      options: {
        formats: ['markdown'],
        onlyMainContent: true,
      }
    });

    logger.info('Batch scrape completed', {
      status: batchResult.status,
      total: batchResult.total,
      completed: batchResult.completed,
    });

    // Transform batch results to PageContent format
    const results: PageContent[] = (batchResult.data || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((doc: any) => doc && doc.markdown) // Only include docs with markdown
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((doc: any) => ({
        url: doc.metadata?.sourceURL || '',
        title: doc.metadata?.title || 'Untitled',
        markdown: doc.markdown || '',
      }));

    logger.info('Scraping complete', {
      successCount: results.length,
      totalUrls: urls.length,
      creditsUsed: batchResult.creditsUsed
    });

    if (results.length === 0) {
      throw new Error('No pages were successfully scraped');
    }

    return results;

  } catch (error) {
    logger.error('Batch scraping failed', { error });
    throw new Error(`Failed to scrape pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
