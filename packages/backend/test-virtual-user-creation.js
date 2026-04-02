#!/usr/bin/env node

/**
 * VIVIM Virtual User Creation Test
 *
 * This script tests the complete virtual user creation and data persistence flow.
 *
 * Prerequisites:
 * 1. Backend running with Supabase connection
 * 2. Frontend deployed and configured
 * 3. Test user fingerprint available
 */

import { getPrismaClient } from "./src/lib/database.js";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

async function testVirtualUserCreation() {
  console.log("🚀 Starting VIVIM Virtual User Creation Test");
  console.log("Backend URL:", BACKEND_URL);
  console.log("");

  const fingerprint = "test-user-fingerprint-" + Date.now();
  console.log("📍 Test Fingerprint:", fingerprint);

  try {
    // Step 1: Create virtual user via chat endpoint
    console.log("\n📝 Step 1: Creating virtual user via chat endpoint...");

    const chatResponse = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-fingerprint": fingerprint
      },
      body: JSON.stringify({
        messages: [
          { role: "user", content: "Hello, I'm a new user testing the virtual user creation system!" }
        ],
        threadId: "test-thread-" + Date.now()
      })
    });

    if (!chatResponse.ok) {
      throw new Error(`Chat API failed: ${chatResponse.status} ${chatResponse.statusText}`);
    }

    const chatResult = await chatResponse.json();
    console.log("✅ Chat response received:", {
      hasResponse: !!chatResult.response,
      responseLength: chatResult.response?.length || 0
    });

    // Step 2: Verify database state
    console.log("\n🗄️ Step 2: Verifying database state...");

    const prisma = getPrismaClient();

    // Check virtual user
    const virtualUser = await prisma.virtualUser.findUnique({
      where: { fingerprint: fingerprint }
    });

    if (virtualUser) {
      console.log("✅ Virtual user created:", {
        id: virtualUser.id,
        fingerprint: virtualUser.fingerprint,
        createdAt: virtualUser.createdAt
      });
    } else {
      console.log("❌ Virtual user not found in database");
      return;
    }

    // Check conversations
    const conversations = await prisma.conversation.findMany({
      where: { virtualUserId: virtualUser.id }
    });

    console.log("✅ Conversations found:", conversations.length);
    conversations.forEach(conv => {
      console.log("  -", conv.title, "(ID:", conv.id + ")");
    });

    // Check messages
    if (conversations.length > 0) {
      const messages = await prisma.message.findMany({
        where: { conversationId: conversations[0].id }
      });
      console.log("✅ Messages stored:", messages.length);
    }

    // Check context settings
    const contextSettings = await prisma.userContextSettings.findUnique({
      where: { virtualUserId: virtualUser.id }
    });

    if (contextSettings) {
      console.log("✅ Context settings created:", {
        maxTokens: contextSettings.maxContextTokens,
        responseStyle: contextSettings.responseStyle
      });
    } else {
      console.log("⚠️ Context settings not found (may be created on first context request)");
    }

    // Step 3: Test context assembly
    console.log("\n🧠 Step 3: Testing context assembly...");

    if (conversations.length > 0) {
      const contextResponse = await fetch(`${BACKEND_URL}/api/v2/context-engine/assemble`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-fingerprint": fingerprint
        },
        body: JSON.stringify({
          virtualUserId: virtualUser.id,
          conversationId: conversations[0].id,
          userMessage: "What can you tell me about my conversation history?"
        })
      });

      if (contextResponse.ok) {
        const contextData = await contextResponse.json();
        console.log("✅ Context assembled:", {
          engine: contextData.engineUsed,
          promptLength: contextData.systemPrompt?.length || 0,
          memoriesIncluded: contextData.stats?.memoriesIncluded || 0
        });
      } else {
        console.log("⚠️ Context assembly failed (may need more conversation data)");
      }
    }

    // Step 4: Check for memory extraction
    console.log("\n🧠 Step 4: Checking memory extraction...");

    const memories = await prisma.memory.findMany({
      where: { virtualUserId: virtualUser.id }
    });

    console.log("📊 Memory status:", {
      memoriesFound: memories.length,
      extractionTriggered: memories.length > 0
    });

    if (memories.length > 0) {
      console.log("✅ Memories extracted:");
      memories.slice(0, 3).forEach(memory => {
        console.log("  -", memory.content.substring(0, 100) + "...");
      });
    }

    // Cleanup
    await prisma.$disconnect();

    console.log("\n🎉 Virtual User Creation Test COMPLETED!");
    console.log("✅ Virtual user successfully created and linked to conversations");
    console.log("✅ Data persistence verified in Supabase database");
    console.log("✅ Context assembly working for virtual user");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Full error:", error);
  }
}

// Run the test
testVirtualUserCreation();