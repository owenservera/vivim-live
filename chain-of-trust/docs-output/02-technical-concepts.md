# VIVIM Technical Architecture

## Foundational Concepts

### The Atomic Conversation Unit (ACU)

The ACU is the fundamental data structure of VIVIM. Every conversation fragment from every provider normalizes into this canonical form:

```
ACU = {
  id: SHA-3-256(DID || provider || timestamp || nonce),
  owner: DID of the sovereign human,
  content: XChaCha20-Poly1305(per-ACU-key, plaintext),
  metadata: { provider, timestamp, model, token_count, topic },
  provenance: Merkle proof from original provider,
  rights_envelope: { tier, co-governance, contracts },
  signature: Ed25519(owner-signing-key, hash of all above)
}
```

**Key properties:**
- Each ACU is independently encrypted
- Compromising one ACU reveals nothing about others
- Every ACU is individually verifiable via Merkle proof
- Rights envelope travels with the data

---

### The Ownership Tensor

Each ACU carries a multi-dimensional rights classification called the **Ownership Tensor**. This is not a simple label—it's a function that determines access based on:

1. **Entity axis**: Who has interest (user, company, client, regulator)
2. **Time axis**: When rights apply (immediate, sunset, expired)
3. **Operation axis**: What can be done (view, share, sell, derive)

```
Ownership Tensor: (entity, operation, time) → {required_approvals, conditions}
```

**Example:**
- A conversation about company strategy → Tier 3 (dual-control)
- Same user's personal questions → Tier 0 (user-only)
- Medical discussion → Tier 5 (regulatory lockbox)

---

### The Consent Lattice

Rights decisions exist in a formal algebraic structure—a **consent lattice**—that enables precise, composable consent definitions:

```
Granularity (G):    field ⊆ acu ⊆ conversation ⊆ provider ⊆ vault
Scope (S):          nobody ⊂ verified ⊂ specific ⊂ everyone
Access Type (A):    view ⊆ aggregate ⊆ train ⊆ derive ⊆ resell
Window (W):         start_time, end_time, max_queries
Terms (T):          price, royalty_rate, currency
```

A consent decision is a morphism:
```
consent : D_u(G) → (S, A, W, T)
```

---

## The Vault Architecture

### Storage Structure

```
VIVIM Vault Directory/
├── vault.vivim              # SQLCipher encrypted database
│   ├── acus                # ACU rows with double encryption
│   ├── merkle_tree         # Integrity tree (root on-chain)
│   ├── ownership_tensors   # Per-ACU classifications (indexed)
│   ├── consent_states      # Current consent configuration
│   ├── canaries            # Planted detection tokens
│   ├── detection_results   # Scan results
│   └── stream_log          # Immutable ingress/egress log
├── vectors.vivim           # Encrypted vector index (semantic search)
├── keys/                   # Encrypted key hierarchy
│   ├── master.key.enc      # Never stored in plaintext
│   ├── provider_keys/      # Per-provider derived keys
│   ├── acu_keys/           # Per-ACU content keys
│   └── tdass_shares/       # Co-governance key shares
└── config.vivim.enc        # Encrypted configuration
```

### Key Hierarchy

All keys derive deterministically from the master key:

```
Master Key (mk) → via Argon2id from BIP-39 mnemonic
│
├── Vault Encryption Key (vek) → SQLCipher
├── ACU Key Derivation Key (akdk)
│   └── Per-ACU Content Keys (ack_i) → Unique per ACU
├── Stream Authentication Key (sak)
│   └── Per-Source Stream Keys (pssk_j) → Per capture tool
├── Provider-Specific Keys (psk_p)
├── TDASS Human Share Keys (thsk) → Co-governance
├── Identity Key (ik) → Ed25519 signing
├── Sync Encryption Key (sek) → Device sync
└── Recovery Key (rk) → Paper backup
```

---

## The Universal Stream Protocol (USP)

The Universal Stream is the only data ingress path—a cryptographic airlock ensuring:

- **Local-only**: Unix domain socket/named pipe, no network access
- **Authenticated**: HMAC with per-source keys (pssk)
- **Encrypted**: XChaCha20-Poly1305 for all payloads
- **Replay-proof**: Strictly monotonic sequence numbers
- **Write-only**: No read path from capture tools

### Droplet Structure

```
DROPLET
├── HEADER (plaintext, authenticated)
│   ├── protocol_version
│   ├── source_id (which capture tool)
│   ├── sequence_number (monotonic)
│   ├── timestamp
│   ├── droplet_type
│   ├── payload_length
│   └── content_hash (pre-encryption)
├── PAYLOAD (encrypted with pssk)
│   ├── provider
│   ├── role (user/assistant/system/tool)
│   ├── content
│   ├── conversation_id
│   ├── model
│   ├── tokens
│   ├── attachments
│   └── capture_meta
├── HMAC TAG (HMAC-SHA-256(pssk, header || payload))
└── ANTI-REPLAY NONCE (HKDF(pssk, sequence_number))
```

### Stream Receiver Pipeline (10 stages)

1. **RECEIVE**: Accept droplet on local socket
2. **AUTHENTICATE**: Verify HMAC tag
3. **SEQUENCE CHECK**: Verify monotonic sequence
4. **DECRYPT PAYLOAD**: XChaCha20-Poly1305
5. **INTEGRITY CHECK**: Verify content_hash
6. **CONTENT VALIDATION**: Schema validation
7. **CLASSIFICATION**: Run ownership classifier
8. **ACU FORMATION**: Assemble and sign ACU
9. **VAULT WRITE**: Atomic database transaction
10. **ACKNOWLEDGE**: Send encrypted ACK

---

## Detection Algorithms

VIVIM includes 13 detection algorithms for verifying data sovereignty:

| Algorithm | Function | Physical Inspiration |
|-----------|----------|----------------------|
| 1. Spectral Membership Inference | Primary detection | Spectroscopy |
| 2. Mutual Information Estimation | Quantify retained info | Information theory |
| 3. Kolmogorov Uniqueness Scoring | Identify most-detectable | Algorithmic complexity |
| 4. Photon Counting | Per-token attribution | Single-photon detection |
| 5. Interference Pattern Detection | Cross-provider contamination | Double-slit experiment |
| 6. Canary Wave Function | Proactive detection | Quantum measurement |
| 7. Boltzmann Calibration | Statistical calibration | Statistical mechanics |
| 8. Holographic Watermarking | Identity encoding | Holographic principle |
| 9. Thermodynamic Flow Tracing | Temporal absorption | Entropy/heat |
| 10. Fisher Information Fingerprinting | Parameter influence | Fisher information |
| 11. Entanglement Testing | Hidden sharing detection | Bell's theorem |
| 12. Diffraction Grating Analysis | Multi-scale analysis | Wave diffraction |
| 13. Conservation Law Verification | Complete accounting | Conservation laws |

---

## Marketplace Protocol

### Selective Disclosure

VIVIM enables selling **parts** of your data without revealing everything:

1. **Commitment**: Publish Merkle root of data subset on-chain
2. **ZK Proof of Properties**: Prove dataset properties without revealing content
3. **Key Exchange**: ECDH for ephemeral delivery key
4. **Encrypted Delivery**: Re-encrypt with buyer key
5. **Verification**: Buyer verifies proofs and delivery

### Minimum Disclosure Review Packets

For co-governed data requiring dual approval, the system constructs **information-bottleneck-optimized packets**—the smallest disclosure sufficient for a decision while minimizing leakage:

```
optimize:  min I(M;R)  subject to  I(R;D) ≥ τ
where:     M = memory object, R = review packet, D = decision
```

---

## Co-Governance (TDASS)

**Temporally Decaying Asymmetric Secret Sharing** handles shared ownership:

- **Active period**: Both human AND third-party key required for exports
- **Sunset transition**: Third-party share progressively fades
- **Post-sunset**: Human-only access (for non-regulated content)
- **Regulated content (Tier 5)**: Dual-key persists indefinitely

This allows companies to govern company-confidential content while ensuring employees retain their cognitive continuity.

---

## Blockchain Layer

### Hybrid Architecture

```
L1 (Main Chain):      PoSov consensus, identity, consent registry
L2 (ZK-Rollup):       Marketplace transactions, batch proofs  
DA (Data Availability): IPFS + erasure coding for encrypted ACUs
```

### Proof of Sovereignty (PoSov)

Validator weight considers:
- Economic stake (security)
- Users hosted (sovereignty contribution)
- Uptime (reliability)
- Imports facilitated (onboarding)

---

## Security Properties

1. **Data Sovereignty**: No one accesses plaintext without user's key
2. **Consent Integrity**: No access without on-chain consent
3. **Revocation Completeness**: Revocations take effect within one block
4. **Fair Exchange**: Atomic swap semantics via escrow
5. **No Unilateral Access**: Dual-control for co-governed data

---

*This is the mathematical and architectural foundation upon which VIVIM is built.*