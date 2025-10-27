import archiver from 'archiver';
import { Logger } from '@/utils/logger';
import type { PageContent } from '@/types/workflow';

const logger = new Logger('Service:ZipGenerator');

/**
 * Phase 3: Generate a zip file from scraped markdown pages
 * Returns a Buffer that can be sent as download
 */
export async function generateZip(pages: PageContent[]): Promise<Buffer> {
  logger.info('Starting zip generation', { pageCount: pages.length });

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    // Create archiver instance
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Collect chunks as they're created
    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    // Handle completion
    archive.on('end', () => {
      const buffer = Buffer.concat(chunks);
      logger.info('Zip generation complete', {
        sizeBytes: buffer.length,
        sizeMB: (buffer.length / 1024 / 1024).toFixed(2)
      });
      resolve(buffer);
    });

    // Handle errors
    archive.on('error', (err: Error) => {
      logger.error('Zip generation failed', { error: err });
      reject(err);
    });

    // Add each page as a markdown file
    pages.forEach((page, index) => {
      // Generate a clean filename from the URL or title
      const filename = generateFilename(page.url, page.title, index);

      logger.info('Adding file to zip', { filename });

      // Add markdown content with metadata header
      const content = `---
title: ${page.title}
url: ${page.url}
---

${page.markdown}`;

      archive.append(content, { name: filename });
    });

    // Finalize the archive
    archive.finalize();
  });
}

/**
 * Generate a clean filename from URL or title
 */
function generateFilename(url: string, title: string, index: number): string {
  try {
    // Try to use the last path segment from URL
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];

    if (lastSegment && lastSegment.length > 0) {
      // Clean the segment and add .md extension
      const cleaned = lastSegment
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase();
      return `${cleaned}.md`;
    }
  } catch {
    // URL parsing failed, fall through to title-based naming
  }

  // Fallback: use title
  if (title && title !== 'Untitled') {
    const cleaned = title
      .replace(/[^a-zA-Z0-9-_\s]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .substring(0, 50); // Limit length
    return `${cleaned}.md`;
  }

  // Last resort: use index
  return `page-${index + 1}.md`;
}
