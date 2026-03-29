# Phase 3, 4 & 5: Sovereign Completion — Non-Slop Specification

## 1. Phase 3: The Sovereign Exit & Identity Ripening
**Objective:** Finalize the "Proof of Being" through confirmed identity and ensure 100% data portability.

### 3.1. The `IdentityCard` Promotion UI
Implement the final stage of **INFERRED_IDENTITY_CORE_LOGIC.md**.
*   **Trigger:** When `ICS > 85%`, the AI presents a non-intrusive "Identity Verification" card.
*   **UX:** *"I am 88% certain you are [Inferred Role]. Would you like to lock this identity into your sovereign vault?"*
*   **Result:** Generates the cryptographic `userId` hash from confirmed facts.

### 3.2. The "Sovereign Export" Dashboard
Replace generic "Download" buttons with a **Portability Terminal**.
*   **Formats:** Export ACUs and TopicProfiles as standard JSON or a queryable SQLite database.
*   **Visualization:** Show a Merkle Tree representation of the vault to prove data integrity.

---

## 2. Phase 4: Anticipatory Intelligence (The Cortex UI)
**Objective:** Visualize the `PrefetchEngine` and `SituationDetector` to show the AI's "Anticipatory" nature.

### 4.1. The "Warming" Status
Add a subtle status bar in the Chat UI that shows which context bundles are currently "Hot" or "Warming."
*   *"Warming 'Software Architecture' bundle..."*
*   *"Hot: Identity Core, Global Prefs, Recent Conversation."*

### 4.2. Situation Archetype Selector
Allow users to manually override the `SituationDetector` if they want to force a specific "Cognitive Mode."
*   **Modes:** Research (High L2/L3 weight), Creative (High L1/L5 weight), Debug (High L4/L6 weight).

---

## 3. Phase 5: Production Hardening & Handover
**Objective:** Full decommissioning of legacy code and hardening of infrastructure.

### 5.1. The "Emergency Mode" UX
Implement the UI for the **Blueprint 5.1 Fallback Strategy**.
*   If Z.AI is down, the UI switches to a "Local-Safe" mode, clearly stating: *"Primary intelligence offline. Running on minimal local context."*

### 5.2. Technical Sunset & Validation
*   **Action:** Delete `packages/backend/src/services/context-generator.js` and `user-context-system.js`.
*   **Action:** Update `packages/backend/src/server.js` with the Dynamic CORS regex.
*   **Action:** Final load-testing of the `Hot Loop` (<200ms target).

---

## 4. The "No-Slop" Final Standards Checklist

1.  **Zero Unused Styles:** All `page.tsx` legacy CSS and redundant Framer Motion variants removed.
2.  **No Static Placeholders:** Every "Stub" or "Placeholder" replaced with a real API-wired component.
3.  **Traceability Mastery:** 100% of AI responses include an assembly trace.
4.  **Identity Sovereignty:** The system functions entirely without an email/password database.

---

## 5. Master Implementation Schedule

| Phase | Focus | Target Date |
| :--- | :--- | :--- |
| **Phase 1** | Structural Modularization | Day 1-2 |
| **Phase 2** | Cognitive Observability | Day 3-5 |
| **Phase 3** | Identity & Portability | Day 6-8 |
| **Phase 4** | Anticipatory Intelligence | Day 9-11 |
| **Phase 5** | Hardening & Deletion | Day 12-14 |

---

### Closing Statement on Conceptual Intent
VIVIM is now more than an AI tool; it is a **Machine Intuition layer** owned by the user. By following this "Non-Slop" spec, we ensure the code quality matches the high mathematical ambition of the backend.
