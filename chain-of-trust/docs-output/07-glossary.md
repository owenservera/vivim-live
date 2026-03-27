# VIVIM Reference Glossary

## Quick Reference

| Term | Definition |
|------|------------|
| **ACU** | Atomic Conversation Unit — the fundamental data structure in VIVIM, representing a single conversation fragment |
| **VIVIM** | The Sovereign Memory Protocol — a system giving humans complete ownership of their AI conversation history |
| **Vault** | The encrypted storage on a user's device containing all their ACUs |
| **USP** | Universal Stream Protocol — the single secure channel for data entering the vault |
| **RBMO** | Rights-Bound Memory Object — a VIVIM data structure that carries rights information |
| **TDASS** | Temporally Decaying Asymmetric Secret Sharing — the co-governance system |
| **TPDI** | Third-Party Determinability Inference — the ML classifier determining ownership tiers |
| **DID** | Decentralized Identifier — the user's on-chain identity |
| **ZK** | Zero-Knowledge — cryptographic proofs that verify without revealing |

---

## Tier System

| Tier | Name | Description | Export Rules |
|------|------|--------------|---------------|
| **T0** | Personal | Purely personal, no external rights | User only |
| **T1** | Personal-Likely | Likely personal, minimal evidence | User only |
| **T2** | Shared-Possibly | Possibly shared, needs review | User only |
| **T3** | Co-Governed | Work/confidential, dual approval | User + Third Party |
| **T4** | Restricted | High sensitivity, strict controls | Enhanced dual |
| **T5** | Regulated | Legal/medical/financial, never leaves | Dual permanently |

---

## Key Files in Vault

```
vault.vivim          — Main encrypted database (SQLCipher)
├── acus             — ACU rows with per-ACU encryption
├── merkle_tree      — Integrity verification tree
├── ownership_tensors — Rights classifications
├── consent_states   — Current consent configuration
├── canaries         — Planted detection tokens
├── detection_results — Scan results
└── stream_log       — Ingress/egress event log

vectors.vivim       — Encrypted vector index for semantic search
keys/               — Encrypted key hierarchy
config.vivim.enc   — Encrypted configuration
```

---

## Key Hierarchy

```
Master Key (mk)
├── Vault Encryption Key (vek) → SQLCipher database
├── ACU Key Derivation Key (akdk) → Per-ACU content keys
├── Stream Authentication Key (sak) → Per-source stream keys
├── Provider Keys (psk_p) → Per-provider operations
├── TDASS Keys (thsk) → Co-governance shares
├── Identity Key (ik) → Ed25519 signing
├── Sync Keys (sek) → Device sync encryption
└── Recovery Key (rk) → Paper backup
```

---

## Detection Algorithms

| # | Algorithm | Purpose |
|---|-----------|---------|
| 1 | Spectral Membership Inference | Primary detection—model "recognizes" your content |
| 2 | Mutual Information Estimation | Quantify info retained in model |
| 3 | Kolmogorov Uniqueness Scoring | Identify most-detectable content |
| 4 | Photon Counting | Per-token attribution |
| 5 | Interference Pattern Detection | Cross-provider contamination |
| 6 | Canary Wave Function | Proactive detection signals |
| 7 | Boltzmann Calibration | Statistical calibration |
| 8 | Holographic Watermarking | Identity encoding across all data |
| 9 | Thermodynamic Flow Tracing | Track when data entered training |
| 10 | Fisher Information Fingerprinting | User-specific model influence |
| 11 | Entanglement Testing | Hidden data sharing detection |
| 12 | Diffraction Grating Analysis | Multi-scale semantic analysis |
| 13 | Conservation Law Verification | Complete information accounting |

---

## Marketplace Concepts

| Concept | Definition |
|---------|------------|
| **Listing** | Offering specific data for sale on marketplace |
| **ZKP** | Zero-knowledge proof of data properties |
| **MDRP** | Minimum Disclosure Review Packet |
| **Vesicle** | Sealed export package |
| **CapToken** | Capability token granting buyer access |
| **Escrow** | Payment held until delivery verified |

---

## Co-Governance Terms

| Term | Definition |
|------|------------|
| **JSC** | Joint Steering Contract — agreement between human and third party |
| **TDASS** | Temporally Decaying Asymmetric Secret Sharing |
| **Dual Control** | Both human and third-party approval required |
| **Sunset** | End of JSC period when third-party governance decays |
| **Rights Node** | Third-party's governance interface |

---

## Cryptographic Constants

| Parameter | Value | Purpose |
|-----------|-------|---------|
| Key derivation | Argon2id | Memory-hard KDF (256MB, 4 iterations) |
| Database encryption | AES-256-CBC via SQLCipher | At-rest encryption |
| Per-ACU encryption | XChaCha20-Poly1305 | Per-ACU content |
| Signing | Ed25519 | Identity and ACU signatures |
| Hashing | SHA-3-256 | Content and Merkle hashing |
| Nonce derivation | HKDF | Per-message nonces |

---

## Protocol Versions

| Component | Version | Status |
|-----------|---------|--------|
| USP | 1 | Current |
| ZK Circuits | Groth16 (fixed), Plonky2/STARK (variable) | Current |
| Blockchain | Hybrid L1/L2/ZK-rollup | Current |

---

## File Locations

| Platform | Vault Path |
|----------|-----------|
| macOS | `~/Library/Application Support/VIVIM/` |
| Windows | `%APPDATA%\VIVIM\` |
| Linux | `~/.config/VIVIM/` |
| Stream Socket | Platform-specific (Unix domain / Named pipe) |

---

## CLI Commands (Reference)

```
vivim init              — Create new vault from mnemonic
vivim unlock            — Unlock vault with passphrase
vivim lock              — Lock vault, wipe keys from memory
vivim import            — Import from provider export
vivim search            — Search vault content
vivim verify            — Verify vault integrity
vivim export            — Export vault (encrypted or plaintext)
vivim canary deploy     — Plant canary tokens
vivim canary scan      — Scan models for canaries
vivim rights classify  — Classify ACU ownership
vivim consent set      — Set consent configuration
vivim marketplace list — List data for sale
vivim marketplace buy  — Purchase data
vivim status           — Show vault status
```

---

## Quick FAQ

**Q: What's the 24 words for?**  
A: They generate your master key via Argon2id. Write them down—they're the only way to recover your vault.

**Q: Can VIVIM see my data?**  
A: No. Encryption keys exist only in your device's memory. There's no server that could read your data.

**Q: What if I lose my 24 words?**  
A: Your vault is unrecoverable. This is intentional—no backdoor means no one else can access your data either.

**Q: Can my employer access my vault?**  
A: No—not unless you explicitly share content through marketplace or sharing. Co-governance means they approve/reject exports of their content, not access your vault.

**Q: Does this work with all AI providers?**  
A: Yes. Import from any provider, capture via extension, and use MCP to connect to any AI assistant.

---

*This glossary provides quick reference for VIVIM concepts and terminology.*