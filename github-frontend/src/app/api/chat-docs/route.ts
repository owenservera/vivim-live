import { NextRequest, NextResponse } from 'next/server';

// Z.AI API Configuration
const ZAI_API_URL = 'https://api.z.ai/api/coding/paas/v4';
const ZAI_MODEL = 'glm-4.7';

// System prompt for the documentation assistant
const SYSTEM_PROMPT = `You are a helpful AI assistant for VIVIM documentation.

VIVIM is a decentralized AI memory platform that allows users to own their AI conversations.

Key topics you can help with:
- SDK installation and usage (npm install @vivim/sdk)
- Context pipeline and memory management
- PWA (Progressive Web App) features
- Network architecture and security (federation, CRDT)
- API reference
- User guides and tutorials
- Getting started guides
- Architecture overview

Guidelines:
- Provide concise, accurate answers based on the documentation
- Include code examples when helpful
- Use markdown formatting for code blocks
- If you don't know something, be honest about it
- Keep responses focused and relevant to VIVIM`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.ZAI_API_KEY;
    
    if (!apiKey) {
      // For development/demo, return a mock response
      const lastUserMessage = messages
        .filter((m: { role: string }) => m.role === 'user')
        .pop();
      
      if (lastUserMessage) {
        return NextResponse.json({
          message: {
            role: 'assistant',
            content: getDemoResponse(lastUserMessage.content),
          },
        });
      }
    }

    // Convert messages to Z.AI format
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    // Call Z.AI API
    const response = await fetch(`${ZAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ZAI_MODEL,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Z.AI API Error:', errorData);
      
      return NextResponse.json(
        { error: 'Failed to get AI response', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      message: data.choices?.[0]?.message || {
        role: 'assistant',
        content: 'I apologize, but I couldn\'t generate a response.',
      },
      usage: data.usage,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function getDemoResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Demo responses for common questions
  if (lowerMessage.includes('install') || lowerMessage.includes('getting started')) {
    return `## Getting Started

To get started with VIVIM, you can install the SDK:

\`\`\`bash
npm install @vivim/sdk
\`\`\`

Then initialize it in your project:

\`\`\`typescript
import { VivimClient } from '@vivim/sdk';

const client = new VivimClient({
  apiKey: 'your-api-key',
});

await client.initialize();
\`\`\`

Would you like more details on any specific aspect?`;
  }
  
  if (lowerMessage.includes('sdk') || lowerMessage.includes('api')) {
    return `## VIVIM SDK

The VIVIM SDK provides several core modules:

- **Core** - Main client and initialization
- **Context** - Memory and context management
- **Network** - P2P networking capabilities
- **Storage** - Local storage with encryption

You can import specific modules:

\`\`\`typescript
import { VivimClient, Context, Storage } from '@vivim/sdk';
\`\`\`

Check the full API reference in the docs for more details.`;
  }
  
  if (lowerMessage.includes('pwa') || lowerMessage.includes('progressive')) {
    return `## PWA Features

VIVIM includes full Progressive Web App support:

- **Offline Support** - Works without internet
- **Push Notifications** - Stay updated
- **Installable** - Add to home screen
- **Background Sync** - Queue actions offline

The PWA is automatically enabled when you deploy to Vercel or any hosting that supports service workers.`;
  }
  
  if (lowerMessage.includes('security') || lowerMessage.includes('encrypt')) {
    return `## Security

VIVIM prioritizes security with:

- **End-to-end encryption** - Your data is encrypted
- **Local-first** - Data stays on your device
- **BYOK support** - Bring Your Own Keys
- **No tracking** - Your conversations are private

The security documentation has more details on encryption schemes and best practices.`;
  }
  
  return `## VIVIM Assistant

Thanks for your question about "${userMessage}"!

I'm here to help you learn about VIVIM. You can ask me about:

- **Getting Started** - Installation and setup
- **SDK Reference** - API and modules
- **Architecture** - How VIVIM works
- **Features** - PWA, security, networking
- **Examples** - Code samples and tutorials

What would you like to know more about?`;
}
