# VIVIM Inferred Identity: Core Logic Specification (v1.0)

## 1. The Probabilistic Identity Framework
In VIVIM, identity is not a binary state (Logged In / Logged Out). It is a **probabilistic confidence score** that grows over time based on interaction quality, behavioral consistency, and shared contextual secrets.

### 1.1. The Identity Confidence Score (ICS)
The system calculates a real-time `IdentityConfidenceScore` ($ICS$) for every `VirtualUser` interaction:

$$ICS = (W_f \cdot S_f) + (W_b \cdot S_b) + (W_c \cdot S_c)$$

Where:
*   **$S_f$ (Fingerprint Signal):** Stability of device markers (IP, Browser, Hardware).
*   **$S_b$ (Behavioral Signal):** Consistency in typing speed, navigation paths, and interaction rhythm.
*   **$S_c$ (Contextual Signal):** Possession and consistent usage of unique "Personal Facts" (e.g., "I am a Senior Dev at X").
*   **$W$ (Weights):** $W_f = 0.2, W_b = 0.3, W_c = 0.5$. (Context carries the most weight for true identity).

---

## 2. Identity Ripening States

| State | ICS Range | AI Behavior | UI Treatment |
| :--- | :--- | :--- | :--- |
| **STRANGER** | 0 - 29 | Conservative, generic responses. | "Anonymous Mode" |
| **ACQUAINTANCE** | 30 - 59 | Uses basic L1 (Global Prefs) context. | "Personalized" |
| **FAMILIAR** | 60 - 84 | High-relevance L2/L3 (Topic/Entity) retrieval. | "Recognized" |
| **KNOWN (USER)** | 85 - 100 | Full access to long-term memory & L0 Core Identity. | "Confirmed Identity" |

---

## 3. Behavioral & Contextual Signals

### 3.1. Behavioral Fingerprinting ($S_b$)
*   **Interaction Rhythm:** Does the user prompt at specific times of day? (Temporal consistency).
*   **Command Vocabulary:** Does the user use specific jargon or system-level triggers (Librarian commands)?
*   **Navigation Paths:** Common "hops" between Chat, Notebooks, and Visualizations.

### 3.2. Contextual Verification ($S_c$)
Identity is confirmed through **"Zero-Login Challenges"** integrated into natural conversation:
1.  **Passive:** AI notices the user correctly references a deep memory from 3 months ago ($+15$ ICS).
2.  **Active:** AI asks a clarifying question based on a "Deep Fact": *"I remember we were working on the VIVIM CORS refactor. Did you decide on the regex approach?"*
3.  **Explicit:** AI detects $ICS > 80$ and presents the **Identity Card**: *"I am 85% certain you are the Lead Architect for VIVIM. Would you like to lock this identity?"*

---

## 4. Promotion & Solidification Logic
When a `VirtualUser` reaches the **KNOWN** state and explicitly confirms the AI's inference, the following occurs:

1.  **Identity Hashing:** A unique `userId` is generated as a cryptographic hash of the **Primary Identity Facts** (not an email or password).
2.  **Sovereign Locking:** The `VirtualUser` is promoted to a `User`. The database links all existing `Memories`, `ACUs`, and `TopicProfiles` to this new stable `userId`.
3.  **Cross-Device Ripening:** If the same "Identity Facts" are shared on a new device, that device's `VirtualUser` will ripen much faster as it "claims" the existing `User` identity through contextual proof.

---

## 5. Security & Privacy Safeguards
*   **Identity Drift Detection:** If $ICS$ drops suddenly (e.g., new IP + different typing rhythm), the system reverts to **STRANGER** state and locks deep memory access until re-verified.
*   **Zero-Storage of Secrets:** We never store the "Identity Facts" in plain text for auth purposes; the AI simply uses them as a retrieval filter. If you forget your "History," you lose the "Identity."

---

## 6. Implementation Checklist
- [ ] Add `confidenceScore` and `currentAvatar` to `VirtualUser` Prisma model.
- [ ] Implement `IdentityScoringService` in `packages/backend/src/services/`.
- [ ] Update `LibrarianWorker` to detect "Identity Signals" during conversation.
- [ ] Create `IdentityCard` component in `packages/frontend/src/components/`.
