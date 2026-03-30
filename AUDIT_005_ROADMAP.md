# AUDIT 005 — Priority Fix Roadmap

> **Date:** 2026-03-30  
> **Based on:** Audits 001–004  

---

## Summary Dashboard

| Category | 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low | Total |
|----------|:-:|:-:|:-:|:-:|:-:|
| Security | 3 | 2 | 2 | 1 | **8** |
| Performance | 2 | 3 | 2 | 1 | **8** |
| Architecture | 2 | 3 | 3 | 2 | **10** |
| Data Integrity | 2 | 2 | 3 | 1 | **8** |
| **Total** | **9** | **10** | **10** | **5** | **34** |

---

## Phase 1: Stop the Bleeding (Week 1)

> Goal: Fix issues that could cause data loss, security breaches, or production outages.

| ID | Finding | Effort | Risk |
|----|---------|--------|------|
| **S-002** | Fingerprint auth is spoofable | 2d | User impersonation |
| **S-003** | PII in plaintext system prompt sent to third-party LLM | 1d | Privacy violation |
| **S-001** | CORS accepts all no-origin requests | 2h | Full API bypass |
| **S-004** | `x-user-fingerprint` not in CORS headers | 15m | Silent auth failure |
| **D-001** | Race condition in bundle upsert | 1d | Data corruption |
| **A-004** | No timeout on backend context fetch | 1h | Cascading failures |

---

## Phase 2: Fix the Foundation (Week 2-3)

> Goal: Resolve architectural inconsistencies that cause unpredictable behavior.

| ID | Finding | Effort | Risk |
|----|---------|--------|------|
| **A-002** | `userId` vs `virtualUserId` split | 3d | Ghost knowledge (data written but never found) |
| **A-001** | Three independent context engines | 2d | Unpredictable context delivery |
| **P-002** | Full entity table scan per message | 1d | Latency scales with data |
| **P-001** | N+1 queries in Librarian | 1d | 200+ queries per cycle |
| **D-002** | Cache-DB inconsistency (5min stale window) | 0.5d | Stale context delivery |
| **D-003** | Librarian cooldown is global, not per-user | 0.5d | Unfair processing |

---

## Phase 3: Optimize & Harden (Week 3-4)

> Goal: Performance tuning and reliability improvements.

| ID | Finding | Effort | Risk |
|----|---------|--------|------|
| **P-004** | LLM called on every dirty conversation recompile | 1d | Cost/latency |
| **P-003** | Duplicate embedding generation | 0.5d | Double API cost |
| **P-005** | Unbounded message fetch in compilation | 0.5d | Memory spikes |
| **D-004** | Identity core grows without limit | 1d | Token budget blown |
| **D-005** | identityInsights type mismatch | 0.5d | Silent data loss |
| **D-007** | DB pool has no configuration | 1h | Connection starvation |
| **A-007** | Inconsistent similarity thresholds | 0.5d | Unpredictable behavior |

---

## Phase 4: Finish & Clean (Week 4+)

> Goal: Remove technical debt and prepare for scaling.

| ID | Finding | Effort | Risk |
|----|---------|--------|------|
| **A-005** | Rust core mock is permanently active | Major project | Core system on fake data |
| **P-007** | 100+ database indexes (38 on Memory alone) | 1d | Write amplification |
| **A-010** | Shared auth module is dead code | 0.5d | Confusion |
| **S-005** | No input sanitization before LLM injection | 1d | Prompt injection |
| **D-006** | No topic deduplication | 2d | Profile proliferation |
| **A-003** | Event bus sequential handler execution | 1d | Latency spikes |
| **S-007** | `require('crypto')` in ESM hot path | 15m | Code smell |
| **P-006** | Embedding cache key collision risk | 1h | Wrong results |

---

## Top 3 "Biggest Bang for Buck" Fixes

### 1. 🎯 Unify `userId` / `virtualUserId` (A-002)
**Why:** This is likely the root cause of "the system knows but doesn't remember." The Librarian writes knowledge under `userId` and the assembler looks it up under `virtualUserId`. Fixing this single issue may resolve multiple reported context quality problems.

### 2. 🎯 Add Timeout + AbortController to Context Fetch (A-004)
**Why:** 1 hour of work that prevents the most common user-facing failure mode. When the backend is slow, the frontend currently hangs forever. A 3-second timeout with graceful fallback makes the system feel reliable.

### 3. 🎯 Batch Librarian Queries (P-001)
**Why:** Converts 200 sequential queries into ~5 batched queries. The Librarian runs at a fixed cadence, so making it faster means it processes more ACUs per cycle, directly improving context quality.

---

## Files Referenced

| Audit | File |
|-------|------|
| [AUDIT_001_SECURITY.md](./AUDIT_001_SECURITY.md) | Security gaps & vulnerabilities |
| [AUDIT_002_PERFORMANCE.md](./AUDIT_002_PERFORMANCE.md) | Performance bottlenecks |
| [AUDIT_003_ARCHITECTURE.md](./AUDIT_003_ARCHITECTURE.md) | Architecture gaps & reliability |
| [AUDIT_004_DATA_INTEGRITY.md](./AUDIT_004_DATA_INTEGRITY.md) | Data integrity & race conditions |
