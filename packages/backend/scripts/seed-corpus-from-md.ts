/**
 * Seed Corpus from Markdown Files
 * 
 * This script reads markdown files from the repository and ingests them
 * into the docCorpus/docChunk tables for semantic search.
 * 
 * Usage: bun run scripts/seed-corpus-from-md.ts
 */

import { readdir, readFile } from 'fs/promises';
import { join, relative, sep } from 'path';
import { createEmbeddingService } from '../src/context/utils/zai-service.js';
import { logger } from '../src/lib/logger.js';
import { getPrismaClient } from '../src/lib/database.js';

const prisma = getPrismaClient();

// Directories to scan for MD files
const CORPUS_DIRS = [
  { path: 'migration-design/knowledge', category: 'architecture' },
  { path: 'chain-of-trust/docs-output', category: 'technical' },
  { path: 'cinematic-platform', category: 'platform' },
  { path: 'INTEGRATION_PLAN', category: 'integration' },
  { path: 'docs', category: 'docs' },
];

const ROOT_DIR = process.cwd().replace('packages' + sep + 'backend', '');

// Chunking configuration
const CHUNK_SIZE = 800; // characters
const CHUNK_OVERLAP = 200; // characters

interface MarkdownFile {
  filePath: string;
  relativePath: string;
  category: string;
  content: string;
}

/**
 * Split text into overlapping chunks
 */
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    
    if (chunk.trim().length > 50) { // Skip tiny chunks
      chunks.push(chunk.trim());
    }
    
    start += chunkSize - overlap;
    
    // Prevent infinite loop if overlap >= chunkSize
    if (start <= chunks.length * (chunkSize - overlap) && chunks.length > 0) {
      break;
    }
  }

  return chunks;
}

/**
 * Read all markdown files from configured directories
 */
async function readMarkdownFiles(): Promise<MarkdownFile[]> {
  const files: MarkdownFile[] = [];

  for (const { path: dir, category } of CORPUS_DIRS) {
    const fullPath = join(ROOT_DIR, dir);
    
    try {
      const entries = await readdir(fullPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.md')) {
          const filePath = join(fullPath, entry.name);
          const content = await readFile(filePath, 'utf-8');
          
          files.push({
            filePath,
            relativePath: join(dir, entry.name),
            category,
            content,
          });
          
          logger.info({ file: entry.name, category }, 'Found markdown file');
        }
      }
    } catch (error: any) {
      logger.warn({ dir, error: error.message }, 'Directory not found, skipping');
    }
  }

  return files;
}

/**
 * Generate embedding for text using Z.AI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const embeddingService = createEmbeddingService();
  
  try {
    const embedding = await embeddingService.embed(text);
    return embedding;
  } catch (error: any) {
    logger.error({ error: error.message }, 'Embedding generation failed');
    // Return zero vector as fallback (1536 dimensions for text-embedding-3-small)
    return new Array(1536).fill(0);
  }
}

/**
 * Main seeding function
 */
async function seedCorpus() {
  logger.info('Starting corpus seeding...');

  // Read markdown files
  const mdFiles = await readMarkdownFiles();
  logger.info({ count: mdFiles.length }, 'Found markdown files');

  if (mdFiles.length === 0) {
    logger.warn('No markdown files found, nothing to seed');
    return;
  }

  let totalChunks = 0;
  let totalDocs = 0;

  for (const file of mdFiles) {
    try {
      logger.info({ file: file.relativePath }, 'Processing file');

      // Create doc corpus entry
      const doc = await prisma.docCorpus.create({
        data: {
          title: file.relativePath.replace('.md', ''),
          sourcePath: file.relativePath,
          category: file.category,
          metadata: {
            originalPath: file.filePath,
            fileSize: file.content.length,
            processedAt: new Date().toISOString(),
          },
        },
      });

      totalDocs++;

      // Chunk the content
      const chunks = chunkText(file.content, CHUNK_SIZE, CHUNK_OVERLAP);
      logger.info({ chunks: chunks.length }, 'Created chunks');

      // Create chunks with embeddings
      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        const embedding = await generateEmbedding(chunkText);

        await prisma.docChunk.create({
          data: {
            corpusId: doc.id,
            chunkIndex: i,
            content: chunkText,
            embedding,
            metadata: {
              chunkSize: chunkText.length,
              totalChunks: chunks.length,
            },
          },
        });

        totalChunks++;
        
        // Log progress every 10 chunks
        if ((i + 1) % 10 === 0) {
          logger.info({ progress: i + 1, total: chunks.length }, 'Chunk progress');
        }
      }

      logger.info({ file: file.relativePath, chunks: chunks.length }, 'File processed');
    } catch (error: any) {
      logger.error({ file: file.relativePath, error: error.message }, 'Failed to process file');
    }
  }

  logger.info({ totalDocs, totalChunks }, 'Corpus seeding completed');
}

/**
 * Cleanup function
 */
async function cleanup() {
  await prisma.$disconnect();
  logger.info('Database connection closed');
}

// Run the seeding
(async () => {
  try {
    await seedCorpus();
  } catch (error: any) {
    logger.error({ error: error.message }, 'Seeding failed');
    process.exit(1);
  } finally {
    await cleanup();
    process.exit(0);
  }
})();
