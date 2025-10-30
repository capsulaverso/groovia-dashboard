import { defineConfig } from 'drizzle-kit';

let databaseUrl = process.env.DATABASE_URL || 
  'postgresql://authenticator:npg_M6Wqf5cFoSRe@ep-bold-poetry-a4sbv5mh-pooler.us-east-1.aws.neon.tech/capsula?sslmode=require';

// Se for Supabase, usar pooler
if (databaseUrl.includes('supabase.co')) {
  databaseUrl = databaseUrl.replace('/v2', '/pooler.v1');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './shared/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: databaseUrl,
  },
});
