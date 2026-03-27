# VIVIM Mermaid Charts - Complete Index

## Overview

This directory contains 6 mermaid diagram files covering all VIVIM system concepts from high-level architecture to detailed processes.

---

## File Index

### 01-system-overview.mmd
**Purpose**: Core system architecture and data flows

**Contains**:
- High-level architecture (User → Vault → External)
- Vault core components
- Key hierarchy derivation
- Universal Stream data flow
- Stream receiver pipeline (10 stages)
- Droplet structure
- ACU lifecycle state machine

**Zoom Level**: 1-3 (System → Components → Data Flow)

---

### 02-rights-detection.mmd
**Purpose**: Rights classification and detection systems

**Contains**:
- Ownership tensor (entity/time/operation axes)
- Tier classification system (T0-T5)
- TPDI classifier architecture
- TDASS co-governance flow
- Dual control approval sequence
- 13 detection algorithms overview
- Detection pipeline
- Canary system state machine

**Zoom Level**: 2-3 (System → Subsystems)

---

### 03-marketplace.mmd
**Purpose**: Marketplace and commerce flows

**Contains**:
- Marketplace process flow
- Listing sequence
- Purchase and delivery sequence
- ZK proof architecture
- Minimum disclosure review packet (MDRP)
- Revenue split for co-governed data
- Pricing models

**Zoom Level**: 2-3 (System → Transactions)

---

### 04-blockchain-sync.mmd
**Purpose**: Blockchain layer and device synchronization

**Contains**:
- Hybrid chain architecture (L1/L2/DA)
- Block structure
- State structure
- Transaction types
- Proof of Sovereignty (PoSov)
- Consensus flow
- Multi-device architecture
- Sync protocol sequence
- CRDT conflict resolution

**Zoom Level**: 2-3 (System → Infrastructure)

---

### 05-biological-analogy.mmd
**Purpose**: Biological mapping and complete system state

**Contains**:
- VIVIM ↔ Biology complete mapping
- Membrane transport mapping
- DNA → Vault mapping
- Immune system → Detection mapping
- Epigenetics → Ownership tensor mapping
- Complete data flow diagram
- System state machine

**Zoom Level**: 1-2 (High-level → Architecture)

---

### 06-development-roadmap.mmd
**Purpose**: Development phases and architecture summary

**Contains**:
- 30-month Gantt chart
- Phase dependency diagram
- Milestone timeline
- Component interaction matrix
- API layer detail
- Security architecture
- Threat model
- Complete architecture summary graph

**Zoom Level**: 1-2 (Planning → Implementation)

---

## Navigation Guide

### For Understanding the System
Start with: `01-system-overview.mmd` → `05-biological-analogy.mmd`

### For Building Components
Study: `01-system-overview.mmd` → `02-rights-detection.mmd` → `04-blockchain-sync.mmd`

### For Marketplace Implementation
Focus on: `03-marketplace.mmd`

### For Detection System
Focus on: `02-rights-detection.mmd` (section on 13 algorithms)

### For Planning Development
Use: `06-development-roadmap.mmd`

### For Security Review
Use: `06-development-roadmap.mmd` (security architecture section)

---

## Diagram Types Used

| Type | Files | Description |
|------|-------|-------------|
| Flowchart | All | Process flows and system relationships |
| Sequence Diagram | 02, 03, 04 | Time-ordered interactions |
| State Diagram | 01, 05 | Lifecycle and state machines |
| Gantt | 06 | Development timeline |
| Timeline | 06 | Milestone planning |
| Graph | 06 | Architecture summaries |

---

## Key Relationships

```
Zoom Level 1: System Context
├── 01-system-overview.mmd
└── 05-biological-analogy.mmd

Zoom Level 2: Subsystem Architecture
├── 02-rights-detection.mmd
├── 03-marketplace.mmd
└── 04-blockchain-sync.mmd

Zoom Level 3: Implementation Details
├── 01-system-overview.mmd (ACU lifecycle, pipeline)
├── 02-rights-detection.mmd (TDASS flow)
└── 03-marketplace.mmd (ZK proofs, MDRP)

Planning:
└── 06-development-roadmap.mmd
```

---

## Visual Legend

### Color Coding (consistent across files)

| Color | Meaning | Files |
|-------|---------|-------|
| **Red/Pink** | Core user-facing components | All |
| **Blue** | Infrastructure/networking | All |
| **Green** | Security/verification | All |
| **Purple** | Marketplace/commerce | 03 |
| **Yellow/Orange** | Classification/rights | 02 |
| **Dark/Navy** | Storage/vault | 01, 04 |

### Shape Conventions
- Rounded rectangles: Services/processes
- Diamonds: Decision points
- Cylinders: Data stores
- Hexagons: External systems

---

## How to Use These Diagrams

### In Markdown/Documentation
Copy the mermaid code blocks into your markdown files:

```markdown
```mermaid
[copy diagram code here]
```
```

### For Presentation
Export individual diagrams as PNG/SVG using mermaid CLI or online tools.

### For Code Analysis
Use diagrams to trace data flows and understand component interactions.

---

*These diagrams provide a complete visual understanding of the VIVIM system from high-level architecture to implementation details.*