#!/usr/bin/env node

/**
 * VIVIM Supabase Database State Check
 *
 * Quick script to verify database connectivity and current state
 */

import { getPrismaClient } from "./src/lib/database.js";

async function checkDatabaseState() {
  console.log("🔍 Checking VIVIM Supabase Database State");
  console.log("");

  try {
    const prisma = getPrismaClient();

    // Test connection
    console.log("📡 Testing database connection...");
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Database connection successful");
    console.log("");

    // Check core tables
    console.log("📊 Checking core tables:");

    const tables = [
      { name: 'profiles', model: 'user' },
      { name: 'conversations', model: 'conversation' },
      { name: 'messages', model: 'message' },
      { name: 'memories', model: 'memory' },
      { name: 'virtual_users', model: 'virtualUser' },
      { name: 'user_context_settings', model: 'userContextSettings' },
      { name: 'context_recipes', model: 'contextRecipe' }
    ];

    for (const table of tables) {
      try {
        const count = await prisma[table.model].count();
        console.log(`  ✅ ${table.name}: ${count} records`);
      } catch (error) {
        console.log(`  ❌ ${table.name}: Error - ${error.message}`);
      }
    }

    // Check for any virtual users
    const virtualUsers = await prisma.virtualUser.findMany({
      select: { id: true, fingerprint: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    if (virtualUsers.length > 0) {
      console.log("");
      console.log("👥 Recent Virtual Users:");
      virtualUsers.forEach(vu => {
        console.log(`  ${vu.id} - ${vu.fingerprint.substring(0, 20)}... - ${vu.createdAt}`);
      });
    }

    // Check recent conversations
    const conversations = await prisma.conversation.findMany({
      select: { id: true, title: true, virtualUserId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    if (conversations.length > 0) {
      console.log("");
      console.log("💬 Recent Conversations:");
      conversations.forEach(conv => {
        console.log(`  ${conv.id} - "${conv.title}" - User: ${conv.virtualUserId || 'anonymous'}`);
      });
    }

    await prisma.$disconnect();

    console.log("");
    console.log("🎉 Database state check completed successfully!");

  } catch (error) {
    console.error("❌ Database check failed:", error.message);
    console.error("Full error:", error);
  }
}

// Run the check
checkDatabaseState();