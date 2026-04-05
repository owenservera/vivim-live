// prisma.config.ts
// Prisma 7.x configuration
import { defineConfig } from 'prisma/config';

const DATABASE_URL = process.env.DATABASE_URL || 
  "postgresql://postgres.hrdoyqlvwipzuslaphva:RMVHuylOJN9gEbAI@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require";

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: DATABASE_URL,
    schemas: ['public', 'auth', 'storage'],
  },
  shadowDatabaseUrl: process.env.DATABASE_SHADOW_URL || DATABASE_URL,
});
