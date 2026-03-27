# Deep Knowledge Extraction Prompts

## Context & Purpose

You are helping build a cinematic, scroll-driven landing page for VIVIM - a sovereign AI memory platform. The current landing page (`vivim-source-code/src`) is basic and doesn't showcase the full power of the VIVIM platform.

We have TWO rich knowledge sources:
1. **`C:\0-BlackBoxProject-0\vivim-app-og\vivim-app`** - The full VIVIM application with server, PWA, SDK, demos
2. **`C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs`** - Comprehensive documentation of features, architecture, vision

Your task is to extract deep knowledge from these sources to inform the migration design.

---

## PROMPT 1: Complete System Architecture

### Context
We need to understand the full VIVIM architecture to determine what features can be showcased in the landing page and how the cinematic experience should be structured.

### Intent
Extract a complete architectural overview that will help us:
- Understand what services exist and how they interact
- Identify which features from the full app can be visualized/demonstrated
- Determine the data flow for potential live demos

### Search Locations
```
Primary:
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\README.md
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\package.json

Secondary:
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\server\src\
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\pwa\src\
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\sdk\
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\common\
```

### What to Extract
1. **Services Overview**: List all major services (server, pwa, sdk, etc.) and their purposes
2. **Technology Stack**: Every framework, library, and runtime with versions
3. **Communication**: How services talk to each other (REST, WebSocket, etc.)
4. **Data Layer**: Databases, caches, storage solutions
5. **Entry Points**: How users access the system

### Output Style
Provide a structured architectural document with:
- High-level system diagram (text-based)
- Service-by-service breakdown
- Technology inventory table
- Data flow description

---

## PROMPT 2: Feature Inventory (Including Unreleased)

### Context
The landing page needs to showcase VIVIM's full capabilities. Many features may exist in code but not be exposed in the current basic landing page. We need to find ALL features.

### Intent
Create a comprehensive feature inventory that will help us:
- Identify features to highlight in the cinematic experience
- Find demo-worthy interactive elements
- Discover unreleased features that could be teasered

### Search Locations
```
Primary:
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\demo\
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\pwa\src\app\
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\sdk\src\

Secondary:
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\server\src\api\
- C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\DEMO\
- C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\sdk.docs\
```

### What to Extract
1. **Landing Page Features**: What does the current basic page show?
2. **Demo Features**: What do the demos showcase?
3. **Core Features**: What can the SDK/server do?
4. **Unreleased**: Search for TODO, FIXME, feature flags, incomplete implementations
5. **UI Features**: What interactive components exist in the PWA?

### Output Style
Provide a table with columns:
| Feature Name | Description | Status (Live/Beta/Dev/Unreleased) | Demo-Worthy (Y/N) | Location |

---

## PROMPT 3: Context Engine Deep Dive

### Context
The Context Engine is VIVIM's core innovation - the 8-layer system (L0-L7) that assembles context for AI interactions. This is a centerpiece feature for the cinematic page.

### Intent
Extract deep technical details about the context engine so we can:
- Design accurate visualizations of the layer system
- Create interactive demonstrations of context assembly
- Explain the value proposition clearly

### Search Locations
```
Primary:
- C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\CONTEXT\
- C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\CORTEX\

Secondary:
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\server\src\context\
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\server\src\cortex\
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\demo\
```

### What to Extract
1. **Layer Details**: What is each layer (L0-L7)? What data does it contain?
2. **Assembly Process**: How are layers combined for AI requests?
3. **JIT Retrieval**: How does just-in-time retrieval work?
4. **Token Management**: How is the ~12,300 token budget allocated?
5. **Memory Types**: What types of memory exist (episodic, semantic, etc.)?

### Output Style
Provide a detailed technical document with:
- Layer-by-layer breakdown with examples
- Data flow diagram for context assembly
- Token budget breakdown table
- Key terminology glossary

---

## PROMPT 4: ACU (Atomic Chat Units) System

### Context
ACUs are the fundamental building block of VIVIM - each conversation is broken into individually searchable, shareable units. This is a key differentiator.

### Intent
Extract complete information about ACUs so we can:
- Design visualizations of the ACU concept
- Create interactive demonstrations
- Explain the value clearly

### Search Locations
```
Primary:
- C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\ACU\
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\README.md

Secondary:
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\server\src\acu\
- C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\MEMORY\
```

### What to Extract
1. **ACU Definition**: What exactly is an ACU?
2. **Structure**: What fields/data does an ACU contain?
3. **Types**: What types of ACUs exist?
4. **Operations**: How are ACUs created, searched, shared?
5. **Comparison**: How is this better than message blocks?

### Output Style
Provide a comprehensive ACU reference with:
- ACU data structure with fields
- Type taxonomy
- Use case examples
- Comparison table (ACU vs traditional)

---

## PROMPT 5: Interactive Demo Patterns

### Context
The cinematic page should include interactive demonstrations. We need to understand how existing demos work to create new cinematic versions.

### Intent
Extract demo implementation details so we can:
- Replicate or enhance demo patterns
- Create new cinematic demos
- Understand what makes demos effective

### Search Locations
```
Primary:
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\demo\
- C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\DEMO\
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\pwa\src\components\

Secondary:
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\src\demo-engine\
- C:\0-BlackBoxProject-0\vivim-source-code\src\components\*-demo*\
```

### What to Extract
1. **Demo Inventory**: List all demos with descriptions
2. **Implementation Patterns**: How do demos work technically?
3. **State Management**: How do demos handle state?
4. **Visualizations**: What charts, graphs, animations exist?
5. **Mock Data**: What fake data is used in demos?

### Output Style
Provide a demo implementation guide with:
- Demo-by-demo breakdown
- Code pattern examples
- Component usage
- Data structures

---

## PROMPT 6: AI Provider Integrations

### Context
VIVIM works with multiple AI providers (OpenAI, Claude, Gemini, etc.). This provider-agnostic approach is a key selling point.

### Intent
Extract integration details so we can:
- Showcase the multi-provider capability
- Design provider switching demos
- Understand integration patterns

### Search Locations
```
Primary:
- C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\AI_API\
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\server\src\providers\

Secondary:
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\sdk\src\
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\.env.example
```

### What to Extract
1. **Providers**: What AI providers are supported?
2. **Integration Method**: How is each provider integrated?
3. **Unified Interface**: How does VIVIM normalize across providers?
4. **Configuration**: How do users configure providers?

### Output Style
Provide an integration reference with:
- Provider list with status
- Integration architecture
- Configuration examples

---

## PROMPT 7: Security & Privacy Architecture

### Context
VIVIM's privacy-first approach is a major differentiator. We need to understand the security architecture to showcase it properly.

### Intent
Extract security details so we can:
- Design privacy visualizations
- Explain zero-knowledge architecture
- Highlight security features

### Search Locations
```
Primary:
- C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\SECURITY\
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\server\src\security\

Secondary:
- C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\sovereign-memory\
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\pwa\src\components\auth\
```

### What to Extract
1. **Encryption**: What encryption is used?
2. **Zero-Knowledge**: How does ZK architecture work?
3. **Authentication**: How is auth handled?
4. **Data Sovereignty**: How is user data protected?
5. **Privacy Features**: What privacy controls exist?

### Output Style
Provide a security architecture document with:
- Encryption details
- Zero-knowledge explanation
- Privacy feature list
- Trust-building elements

---

## PROMPT 8: Product Vision & Messaging

### Context
The cinematic page needs compelling copy that matches VIVIM's brand voice. We need to understand the core messaging and positioning.

### Intent
Extract product vision and messaging so we can:
- Match the brand voice
- Use correct terminology
- Understand the value proposition

### Search Locations
```
Primary:
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\README.md
- C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\PITCH\
- C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\MEMORY\

Secondary:
- C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\ACU\
- C:\0-BlackBoxProject-0\vivim-source-code\src\app\page.tsx
```

### What to Extract
1. **Tagline**: What is the core tagline?
2. **Value Props**: Key value propositions
3. **Problems Solved**: What problems does VIVIM solve?
4. **Differentiation**: What makes it unique?
5. **Terminology**: Key terms and their definitions

### Output Style
Provide a messaging reference with:
- Core messages
- Key terminology glossary
- Problem/solution mapping
- Brand voice guidelines

---

## PROMPT 9: SDK & Developer Features

### Context
VIVIM has an SDK for developers. This is a key audience for the landing page.

### Intent
Extract SDK details so we can:
- Design SDK showcase sections
- Create developer-focused content
- Show integration examples

### Search Locations
```
Primary:
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\sdk\
- C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\sdk.docs\

Secondary:
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\README.md
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\package.json
```

### What to Extract
1. **SDK Purpose**: What is the SDK for?
2. **Capabilities**: What can developers do with it?
3. **API Surface**: What methods are available?
4. **Integration**: How do you use it?
5. **Examples**: What do code examples look like?

### Output Style
Provide an SDK overview with:
- Capability inventory
- API summary
- Code examples
- Use cases

---

## PROMPT 10: Data Models & Schemas

### Context
We need accurate data models to create realistic interactive demos and visualizations.

### Intent
Extract data models so we can:
- Create accurate mock data for demos
- Design proper visualizations
- Ensure technical accuracy

### Search Locations
```
Primary:
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\common\
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\server\src\
- C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\DATABASES\

Secondary:
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\pwa\src\types\
```

### What to Extract
1. **TypeScript Interfaces**: Key types and interfaces
2. **Database Schemas**: Table structures
3. **API Response Formats**: Data shapes from API
4. **Memory Structures**: How memory is stored

### Output Style
Provide a data reference with:
- Key interface definitions
- Schema diagrams
- Example data

---

## PROMPT 11: UI Components & Design System

### Context
We need to understand existing UI components to maintain consistency and find reusable patterns.

### Intent
Extract component information so we can:
- Find reusable components
- Maintain design consistency
- Identify animation patterns

### Search Locations
```
Primary:
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\pwa\src\components\
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\assets\
- C:\0-BlackBoxProject-0\vivim-source-code\src\components\

Secondary:
- C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\FRONTEND\
```

### What to Extract
1. **Component Library**: What components exist?
2. **Styling Approach**: CSS, Tailwind, styled-components?
3. **Design Tokens**: Colors, fonts, spacing?
4. **Animations**: What animation libraries/patterns?
5. **Responsive**: How is responsiveness handled?

### Output Style
Provide a component reference with:
- Component inventory
- Styling approach
- Animation patterns
- Design tokens

---

## PROMPT 12: Unreleased & Hidden Features

### Context
There may be features in development that aren't yet shipped. These could be exciting teasers for the cinematic page.

### Intent
Find unreleased features so we can:
- Consider teasing upcoming features
- Understand the roadmap
- Avoid promising things that aren't ready

### Search Locations
```
All of:
- C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\
- C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\
```

### What to Extract (Search Patterns)
1. **TODO/FIXME**: `grep -r "TODO\|FIXME" --include="*.ts" --include="*.tsx"`
2. **Feature Flags**: `grep -r "feature.*flag\|enabled\|disabled" --include="*.ts"`
3. **In Progress**: Look for files with "WIP", "in-progress", "experimental"
4. **Roadmap Docs**: Check for future plans in docs
5. **Commented Code**: Look for large blocks of commented code

### Output Style
Provide a hidden features inventory with:
- Feature name
- Current status
- Location in code
- Teaser potential (Y/N)

---

## How to Use These Prompts

### With Explore Agents (Recommended)
```bash
# Run in parallel for speed
task(subagent_type="explore", prompt="[paste full prompt content]")
```

### With Research Companion
```bash
research-companion_research("[prompt content]")
```

### Manual Extraction
1. Read the search locations
2. Use grep/find to locate relevant files
3. Read and synthesize the information
4. Format according to output style

---

## Expected Output Storage

Create files in `migration-design/knowledge/`:
- `01-architecture.md`
- `02-features.md`
- `03-context-engine.md`
- `04-acus.md`
- `05-demos.md`
- `06-integrations.md`
- `07-security.md`
- `08-messaging.md`
- `09-sdk.md`
- `10-data-models.md`
- `11-components.md`
- `12-unreleased.md`
