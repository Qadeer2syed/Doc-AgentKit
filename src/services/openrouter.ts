import { env } from '@/config/env';
import { Logger } from '@/utils/logger';
import type { PageMetadata } from '@/types/workflow';

const logger = new Logger('Service:OpenRouter');

/**
 * Phase 2: Use GPT-4o via OpenRouter to select relevant pages based on user's task
 * Takes all page metadata and task description, returns selected URLs
 */
export async function selectRelevantPages(
  pages: PageMetadata[],
  taskDescription: string
): Promise<string[]> {
  logger.info('Starting LLM page selection', {
    totalPages: pages.length,
    taskLength: taskDescription.length
  });

  // Build the prompt for GPT-4o
  const pagesJson = JSON.stringify(pages, null, 2);
  const prompt = `You are helping a developer find relevant documentation pages for their task.

Task Description:
${taskDescription}

Available Documentation Pages:
${pagesJson}

Instructions:
1. Analyze the task description carefully
2. Review all available documentation pages
3. Select ONLY the pages that are directly relevant to completing this task
4. Be selective - only include pages that provide essential information
5. Return ONLY a JSON array of selected URLs, nothing else

Example output format:
["https://example.com/page1", "https://example.com/page2"]

Your response (JSON array only):`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.NEXT_PUBLIC_APP_URL,
        'X-Title': 'Documentation Workflow App',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.3, // Lower temperature for more focused selection
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json();
    const responseText = data.choices[0]?.message?.content || '';

    logger.info('Received LLM response', { responseLength: responseText.length });

    // Parse the JSON array of URLs
    const selectedUrls = JSON.parse(responseText.trim());

    if (!Array.isArray(selectedUrls)) {
      throw new Error('LLM response is not an array');
    }

    logger.info('Page selection complete', {
      selected: selectedUrls.length,
      total: pages.length,
      percentage: ((selectedUrls.length / pages.length) * 100).toFixed(1) + '%'
    });

    return selectedUrls;

  } catch (error) {
    logger.error('LLM selection failed', { error });
    throw new Error(`Failed to select pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
