import { getPrismaClient } from './src/lib/database.js';

async function checkDatabaseState() {
  const prisma = getPrismaClient();
  
  try {
    // Get all tables
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('=== DATABASE TABLES ===');
    console.log(`Total tables: ${tables.length}\n`);
    
    // Check key tables for virtual user system
    const keyTables = [
      'virtual_users',
      'virtual_sessions', 
      'virtual_conversations',
      'virtual_messages',
      'virtual_memories',
      'virtual_acus',
      'memories',
      'context_recipes',
      'conversations',
      'messages',
      'tenants',
      'feature_flags'
    ];
    
    for (const tableName of keyTables) {
      try {
        const columns = await prisma.$queryRawUnsafe(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = '${tableName}' 
          ORDER BY ordinal_position
        `);
        
        console.log(`\n📋 ${tableName} (${columns.length} columns):`);
        columns.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? '?' : '!';
          console.log(`   ${nullable} ${col.column_name}: ${col.data_type}`);
        });
      } catch (e) {
        console.log(`\n❌ ${tableName}: NOT FOUND`);
      }
    }
    
    // Check if feature_flags table exists
    const featureFlagsExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'feature_flags'
      ) as exists
    `);
    
    console.log('\n\n=== FEATURE FLAGS TABLE ===');
    console.log(featureFlagsExists[0].exists ? '✅ Exists' : '❌ Missing');
    
    // Check indexes on key tables
    console.log('\n\n=== KEY INDEXES ===');
    const indexes = await prisma.$queryRawUnsafe(`
      SELECT tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('virtual_users', 'virtual_conversations', 'virtual_messages', 'virtual_memories', 'memories', 'context_recipes')
      ORDER BY tablename, indexname
      LIMIT 50
    `);
    
    indexes.forEach(idx => {
      console.log(`   ${idx.tablename}.${idx.indexname}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState();
