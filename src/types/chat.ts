export interface DualContext {
  user: UserContext;
  docs: DocsContext;
}

export interface UserContext {
  id: string;
  preferences: {
    language: string;
    responseStyle: "concise" | "detailed" | "balanced";
    expertise: "beginner" | "intermediate" | "expert";
  };
  sessionContext: {
    currentPage?: string;
    recentActions?: string[];
    timeZone?: string;
  };
  memory?: {
    recentTopics?: string[];
    preferredFormat?: string;
  };
}

export interface DocsContext {
  corpusId: string;
  relevantDocs: string[];
  filters?: {
    categories?: string[];
    tags?: string[];
  };
  semanticSearch?: {
    enabled: boolean;
    threshold: number;
    maxResults: number;
  };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  context: DualContext;
  threadId?: string;
}

export interface StreamChunk {
  id: string;
  choices: Array<{
    index: number;
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
