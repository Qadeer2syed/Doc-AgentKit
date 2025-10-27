import { NextRequest, NextResponse } from 'next/server';
import { generateZip } from '@/services/zipGenerator';
import { Logger } from '@/utils/logger';
import type { PageContent } from '@/types/workflow';

const logger = new Logger('API:GenerateZip');

/**
 * POST /api/generate-zip
 * Phase 3: Generate and download zip file from scraped pages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pages } = body as { pages: PageContent[] };

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pages array is required' },
        { status: 400 }
      );
    }

    logger.info('Generate zip request received', { pageCount: pages.length });

    // Generate zip file
    const zipBuffer = await generateZip(pages);

    logger.info('Zip generated successfully', {
      sizeBytes: zipBuffer.length
    });

    // Return zip file as download
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="documentation-${Date.now()}.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });

  } catch (error) {
    logger.error('Zip generation failed', { error });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
