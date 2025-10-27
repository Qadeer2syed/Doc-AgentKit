import { NextRequest, NextResponse } from 'next/server';
import { selectRelevantPages } from '@/services/openrouter';
import { scrapePages } from '@/services/firecrawl';
import { Logger } from '@/utils/logger';
import type { PageMetadata } from '@/types/workflow';

const logger = new Logger('API:SelectAndScrape');

/**
 * POST /api/select-and-scrape
 * Phase 2: Use LLM to select relevant pages, then scrape them for full content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pages, taskPrompt } = body as {
      pages: PageMetadata[];
      taskPrompt: string;
    };

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pages array is required' },
        { status: 400 }
      );
    }

    if (!taskPrompt || taskPrompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task prompt is required' },
        { status: 400 }
      );
    }

    logger.info('Select and scrape request received', {
      pageCount: pages.length,
      promptLength: taskPrompt.length
    });

    // Step 1: Use LLM to select relevant pages
    logger.info('Starting LLM selection');
    const selectedUrls = await selectRelevantPages(pages, taskPrompt);

    if (selectedUrls.length === 0) {
      return NextResponse.json({
        success: true,
        selectedPages: [],
        selectedCount: 0,
        message: 'No relevant pages found for this task'
      });
    }

    // Step 2: Scrape the selected pages for full markdown content
    logger.info('Starting page scraping', { urlCount: selectedUrls.length });
    const scrapedPages = await scrapePages(selectedUrls);

    logger.info('Select and scrape complete', {
      selected: selectedUrls.length,
      scraped: scrapedPages.length
    });

    return NextResponse.json({
      success: true,
      selectedPages: scrapedPages,
      selectedCount: scrapedPages.length
    });

  } catch (error) {
    logger.error('Select and scrape failed', { error });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
