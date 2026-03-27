# VIVIM: Core Mathematical Foundations

## The Rights Algebra

### Rights-Bound Memory Object (RBMO)

A conversation fragment in VIVIM is not a flat data structure. It's a rights-bearing object:

```
RBMO = (content, segmentation, provenance, rights_envelope, derivation, key_material)

Where:
- content: Encrypted conversation payload
- segmentation: Span-level rights labels (P, M, C, R, U)
- provenance: Chain of custody from original source
- rights_envelope: {entity, operation, time} → required_approvals
- derivation: Ancestry if derived from other ACUs
- key_material: Encryption keys (per-ACU, TDASS shares if co-governed)
```

### Rights Topology

A memory item doesn't have one owner—it has a **rights topology**:

```
R(m) = (V_R, E_R, ω_R)

Where:
- V_R: Rights principals (human, company, client, regulator)
- E_R: Governance relations (custody, co-control, oversight)
- ω_R: Weighted control functions per operation
```

### Action-Conditional Ownership

Ownership is action-dependent, not binary:

```
Ω(m, a) → P(V_R)

Example:
- VIEW_LOCAL → {human}           # Human only
- EXPORT_EXTERNAL → {human, company}  # Dual approval
- SELL → {human} (if Tier 0) or {human, company} (if Tier 3)
- DELETE → {human, legal_hold}  # If legally held
```

---

## The Detection Mathematics

### Spectral Membership Inference (Algorithm 1)

The core detection: measure how much a model "recognizes" your specific content versus paraphrases.

**Input**: Your ACU set, target model  
**Output**: Membership score per ACU

```
For each ACU:
1. Extract prompt/response
2. Query model: get log probabilities on response
3. Compute loss: L = -mean(log P(response | prompt))
4. Generate k paraphrases of prompt
5. Query model: get loss on each paraphrase: L_ref_1...L_ref_k
6. Compute z-score: z = (L - mean(L_ref)) / std(L_ref)
7. Negative z → model has LOWER loss on original → "recognizes" it

Score = sigmoid(-z) × (1 + absorption_lines / response_length)
```

**Interpretation**:
- 0.0-0.2: No recognition
- 0.4-0.6: Moderate evidence
- 0.8-1.0: Near-certain training inclusion

### Photon Counting Attribution (Algorithm 4)

Per-token attribution—which tokens came from your data vs. general knowledge:

```
For each token t in model's output:
  p_target = P_M(t | context)
  p_ref = P_M_ref(t | context)  # Reference model without your data
  info_gain = log2(p_target / p_ref)
  
  # Positive info_gain = target knows more than ref
  # This "extra knowledge" likely from your data
```

### Canary Wave Function (Algorithm 6)

Plant unique phrases that become detection signals:

```
Canary Properties:
- Natural: Looks like genuine content
- Unique: Statistically impossible to generate independently
- Attributable: Contains recoverable user signature
- Detectible: Can be found through probing

Detection Process:
|canary⟩ = α|undetected⟩ + β|detected⟩
"Measurement" = query model with canary probe
If model shows knowledge → wave function collapses → proof of training
```

---

## The Information Theory

### Mutual Information for Detection

The fundamental detection equation:

```
I(X_u; Y | Q) ≤ I(X_u; Θ)

Where:
- X_u: User's private data
- Y: Model's outputs (observable)
- Θ: Model weights (not accessible)
- Q: Probe queries

We can only observe a LOWER BOUND on information transfer.
If we detect influence through the API, actual influence is larger.
```

### Minimal Disclosure Review Packets

For co-governed data requiring approval, we need **minimum necessary disclosure**:

```
Optimize: min I(M; R)  subject to  I(R; D) ≥ τ

Where:
- M: Full memory object
- R: Review packet (what third party sees)
- D: Decision (approve/deny)
- τ: Decision threshold

I(M;R): Information about memory that leaks through review
I(R;D): Information in review that's needed for decision

The packet should reveal only the minimum bits for valid decision.
```

### Derivative Contamination

When content is derived from protected sources, rights may inherit:

```
CIIS(y, S) = I(S; y | B)

Where:
- y: Derivative content
- S: Source ACU set
- B: Public baseline knowledge
- CIIS: Conditional Information Inheritance Score

If CIIS > threshold: derivative inherits rights from source
```

---

## The Cryptographic Constructions

### Dual-Sign Capability Composition (DSCC)

For co-governed content, a release capability requires both signatures:

```
User signature: σ_u = Sign(sk_u, H(m|a|d|p|T|C))
Third-party signature: σ_t = Sign(sk_t, H(m|a|d|p|T|C))

Capability: χ = (σ_u, σ_t, metadata)

Verifier accepts iff:
- Both signatures valid
- Same payload hash
- Contract C active
- Not revoked
```

### TDASS: Temporally Decaying Asymmetric Secret Sharing

For co-governed content, both keys required initially, then decay:

```
Active period (JSC active):
  - Human key share + Third-party key share both required
  - Export requires both signatures

Sunset transition (JSC ended):
  - Third-party share weight decays over time
  - After sunset: human-only access (for non-regulated)

Post-sunset:
  - No third-party approval needed
  - Except Tier 5 (regulated): dual-key persists indefinitely
```

---

## The Blockchain Formalism

### Consent Lattice

Consent decisions form a lattice structure:

```
G (granularity): field ⊆ acu ⊆ conversation ⊆ provider ⊆ vault
S (scope): ∅ ⊂ verified ⊂ specific ⊂ B_buyers  
A (access): view ⊆ aggregate ⊆ train ⊆ derive ⊆ resell
W (window): start, end, max_queries
T (terms): price, royalty, currency
```

### On-Chain State

```
ConsentRoot_u = MerkleRoot({H(c_i)} for c_i in π_u)
VaultRoot_u = MerkleRoot({ACU_id_j} for j in vault)
```

ZKP proves: "A valid consent exists without revealing full consent set"

---

## Key Theorems

### Theorem 1: Custody-Control Separation
A principal may retain complete cryptographic custody while action authority over subsets is jointly governed.

### Theorem 2: Information Inheritance Principle
If derivative y retains nontrivial conditional mutual information about protected source x beyond public baseline B, then y inherits rights burden from x.

```
I(x; y | B) > ε  →  y inherits rights from x
```

### Theorem 3: Minimal Governance Disclosure
There exists review representation R* that minimizes disclosure subject to decision sufficiency.

```
R* = argmin_R I(M; R)  s.t.  I(R; D) ≥ τ
```

### Theorem 4: Veto Safety
For any action requiring 2-of-2 approval, no unilateral actor can produce valid external release capability.

---

## Complexity Bounds

| Operation | Time | Space (on-chain) |
|-----------|------|-------------------|
| ACU Import | O(n log n) | O(1) — only root update |
| Consent Update | O(log n) | O(1) — only root update |
| Ownership Proof (ZKP) | O(d) Merkle depth | O(1) — constant |
| Marketplace Listing | O(1) | O(descriptor) |
| Purchase (atomic) | O(1) | O(1) |
| Context Assembly | O(k log n) | Off-chain |
| Batch Verification | O(log² m) | O(1) — recursive proof |

---

*These mathematical foundations give VIVIM its precision—every rights decision, every detection, every marketplace transaction has formal mathematical grounding.*