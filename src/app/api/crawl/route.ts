import { NextRequest, NextResponse } from 'next/server';
import { crawlForMetadata } from '@/services/firecrawl';
import { Logger } from '@/utils/logger';

const logger = new Logger('API:Crawl');

/**
 * POST /api/crawl
 * Phase 1: Crawl documentation site for lightweight metadata
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    logger.info('Crawl request received', { url });

    // Crawl for metadata
    const pages = await crawlForMetadata(url);

    logger.info('Crawl successful', { pageCount: pages.length });

    return NextResponse.json({
      success: true,
      pages,
      totalPages: pages.length
    });

  } catch (error) {
    logger.error('Crawl failed', { error });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
