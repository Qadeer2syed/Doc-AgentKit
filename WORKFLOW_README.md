# Documentation Workflow for Coding Agents

AI-powered documentation discovery and packaging system that helps coding agents get the exact documentation they need.

## 🎯 How It Works

This workflow uses a **3-phase ReactFlow interface** to intelligently extract documentation:

### Phase 1: Discover (Node 1)
- Enter any documentation URL
- Firecrawl automatically discovers all pages and subpages
- Extracts lightweight metadata (title, description, URL)
- **Fast & cheap** - no full content downloaded yet

### Phase 2: AI Selection & Scraping (Node 2)
- Describe your task in natural language
- GPT-4o via OpenRouter analyzes all pages
- Intelligently selects only relevant pages
- **Batch scrapes** selected pages for full markdown content (faster & more reliable)

### Phase 3: Package (Node 3)
- Generates a downloadable zip file
- Contains markdown files with frontmatter metadata
- Ready for coding agents to use

## 🚀 Setup Instructions

### 1. Install Dependencies

Already installed! The following packages are ready:
- `@mendable/firecrawl-js` - Web crawling
- `archiver` - Zip file generation
- OpenRouter API (via fetch)

### 2. Configure API Keys

Create a `.env.local` file in the project root:

```bash
# Copy from example
cp .env.example .env.local
```

Then add your API keys:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Get from: https://firecrawl.dev
FIRECRAWL_API_KEY=fc-YOUR-API-KEY

# Get from: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-YOUR-API-KEY
```

### 3. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📖 Usage Example

### Example 1: Stripe Payment Integration

**Node 1 Input:**
```
URL: https://docs.stripe.com
```

**Node 2 Input:**
```
Task: I want to implement recurring subscription billing with webhooks for payment events
```

**Result:**
- LLM selects: `/subscriptions`, `/webhooks`, `/billing`, etc.
- Downloads ~10-15 relevant pages as markdown
- Ignores unrelated pages about one-time payments, connect, etc.

### Example 2: Next.js App Router

**Node 1 Input:**
```
URL: https://nextjs.org/docs
```

**Node 2 Input:**
```
Task: Build a server-side rendered blog with dynamic routes and API endpoints
```

**Result:**
- LLM selects: `/app-router`, `/server-components`, `/dynamic-routes`, `/api-routes`
- Packages only relevant documentation

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Node 1     │─────▶│   Node 2     │─────▶│   Node 3    │
│  Crawl      │      │  AI Select   │      │  Package    │
│             │      │  & Scrape    │      │             │
└─────────────┘      └──────────────┘      └─────────────┘
     │                      │                      │
     ▼                      ▼                      ▼
  Firecrawl            OpenRouter              Archiver
  (metadata)           (GPT-4o)                (zip)
```

## 🔧 API Endpoints

- `POST /api/crawl` - Phase 1: Crawl for metadata
- `POST /api/select-and-scrape` - Phase 2: LLM selection + scraping
- `POST /api/generate-zip` - Phase 3: Generate zip file

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── crawl/route.ts           # Phase 1 API
│   │   ├── select-and-scrape/route.ts # Phase 2 API
│   │   └── generate-zip/route.ts    # Phase 3 API
│   └── page.tsx                     # Main ReactFlow UI
├── components/
│   └── workflow/
│       ├── CrawlNode.tsx            # Node 1 component
│       ├── SelectNode.tsx           # Node 2 component
│       └── ZipNode.tsx              # Node 3 component
├── services/
│   ├── firecrawl.ts                 # Crawling & scraping logic
│   ├── openrouter.ts                # LLM selection logic
│   └── zipGenerator.ts              # Zip creation logic
├── types/
│   └── workflow.ts                  # TypeScript interfaces
└── config/
    └── env.ts                       # Environment validation
```

## 💡 Tips

1. **Start small**: Test with a small docs site first (e.g., 10-50 pages)
2. **Be specific**: The more specific your task description, the better the LLM selection
3. **Check results**: Node 2 shows how many pages were selected
4. **Cost optimization**: Lightweight crawl in Phase 1 means you only pay for selected pages
5. **Batch scraping**: Phase 2 uses batch scraping which is faster and more reliable than individual requests
6. **API keys required**: Both Firecrawl and OpenRouter API keys are needed for the workflow to function

## 🐛 Troubleshooting

### "Invalid environment variables"
- Make sure `.env.local` exists with valid API keys
- Restart the dev server after adding env vars

### Crawl returns 0 pages
- Check if the URL is accessible
- Some sites may block crawlers
- Try a different documentation site

### LLM selection fails
- Verify OpenRouter API key is valid
- Check that you have credits in your OpenRouter account
- Ensure task description is clear

### Scraping timeouts
- The app now uses batch scraping which handles timeouts automatically
- If batch scraping fails, check your Firecrawl API credits
- Firecrawl's batch scraping is more reliable than individual scrapes

## 🎨 Customization

### Change LLM Model
Edit `src/services/openrouter.ts`:
```typescript
model: 'openai/gpt-4o-mini', // Cheaper alternative
// or
model: 'anthropic/claude-3.5-sonnet', // Different provider
```

### Adjust Crawl Limit
Edit `src/services/firecrawl.ts` in the `crawlForMetadata` function:
```typescript
limit: 500, // Increase/decrease max pages (default: 100)
```

### Use Batch Scraping Options
The Phase 2 scraping now uses Firecrawl's `batchScrape` for better performance. You can customize options in `src/services/firecrawl.ts`:
```typescript
const batchResult = await firecrawl.batchScrape(urls, {
  options: {
    formats: ['markdown'],
    onlyMainContent: true,
    // Add more options like timeout, location, etc.
  }
});
```

## 🚀 Technical Highlights

- **Batch Scraping**: Uses Firecrawl's batch scraping API for reliable multi-page scraping
- **ReactFlow Visualization**: Interactive visual workflow with real-time status updates
- **Type Safety**: Full TypeScript support with proper type definitions
- **Error Handling**: Graceful error handling with detailed logging
- **Cost Efficient**: Two-phase approach minimizes API costs

## 📊 Performance

- **Phase 1 (Crawl)**: ~2-5 seconds for 100 pages (metadata only)
- **Phase 2 (LLM + Batch Scrape)**: ~10-30 seconds for 10-15 selected pages
- **Phase 3 (Zip)**: <1 second for most documentation sets

## 📄 License

MIT
