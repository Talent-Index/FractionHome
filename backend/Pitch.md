# FractionHome: Tokenizing Real Estate for Transparent, Low-Friction Ownership (Avalanche)

## Purpose

FractionHome demonstrates how real estate can be transformed into divisible, tradable digital shares so anyone can verify fractional ownership on a fast, low-fee public blockchain. The MVP proves the technical flow—from property upload to **Avalanche (C-Chain) tokenization** and simulated investor trades—without requiring user accounts or payment integrations.

## Motivation

Real estate is traditionally illiquid, expensive to co-own, and opaque. FractionHome removes these frictions by leveraging **Avalanche**, which provides:

* **Fast, sub-second finality** — critical for asset transfers and ownership proofs.
* **Low fees** — enabling micro-ownership (even KSh700–KSh1,000 per token).
* **EVM-compatibility** — meaning tokens follow familiar ERC-20 patterns and integrate with wallets like MetaMask.
* **Scalability** via optional Subnets — future-proofing the platform for regulated or private markets.

This MVP intentionally removes onboarding complexity (no login/KYC) to focus on proving real-asset tokenization patterns that regulators, investors, and partners can understand immediately.

## What it shows

* End-to-end tokenization pipeline: property metadata → IPFS → on-chain Avalanche token contract.
* Simulated secondary market: treasury → investors → peer-to-peer transfers using standard ERC-20 mechanics.
* Real-time ownership visibility: balances pulled directly from the Avalanche C-Chain and displayed in a dashboard.

## Why it matters

* Makes real estate understandable and investable at **token-level granularity**.
* Provides a **verifiable on-chain source of truth** about ownership.
* Demonstrates key primitives before adding payments, KYC, compliance, Subnets, or custody partners.
* Enables retail and diaspora investors to buy **small, affordable pieces** of high-value assets.

This MVP becomes a clear, repeatable demo for hackathons, investor pitches, and regulatory workshops.

## Ask / Next Steps

* Use this Avalanche-based demo to validate assumptions with real users and regulators.

* Explore integrating:

  * **payment rails (M-Pesa, card, PayPal)**
  * **KYC/AML**
  * **automated compliance via Subnets**
  * **secondary trading rules**

* Expand beyond one-asset-at-a-time into a full marketplace.

FractionHome is a focused, demonstrable step toward more liquid, transparent real-estate ownership using **Avalanche and verifiable on-chain token balances**.

---

# Story

Why did the software engineer buy a house?
To finally get root access to his own backyard.

Back in high school I stumbled across *Rich Dad Poor Dad* and got hooked on real estate. The idea stuck—own a slice of something tangible and let it work for you. I became a SWE, did the math, and mapped out a 20-year plan to own property. FractionHome is designed to make that path far more accessible to the next generation: not a whole house at once, but one token at a time.

---

# Head-turning stats (Kenya — illustrative)

* **Total real-estate stock** ≈ KSh42 trillion.
  Tokenizing 1% → KSh420 billion of digitized real-world assets.
* **Nairobi metro** ≈ KSh2.8–4.2 trillion — enough scale to create liquid markets.
* **Population 55M**, with ~35–40% urban and mobile-first behaviour.
* **Diaspora remittances** ≈ KSh560 billion+/year — strong appetite for local investment.
* **Small tickets become possible:**

  * KSh70 million property
  * Split into 100,000 tokens
  * ~KSh700 per token

Avalanche’s **low fees** and **fast finality** make sub-KSh1,000 property shares feasible—something impractical on slow or expensive chains.

---

# Software Is Eating the World

## Where tokenization has already worked

### Paxos PAXG

Digital tokens backed by physical gold held in custody.

### BlackRock BUIDL Fund

Tokenized money-market fund showing competitive returns and institutional acceptance.

### Real-estate tokenization example

St. Regis Aspen Resort raised ~KSh2.7 billion by issuing fractional digital securities.

---

# Why it hasn’t worked in Kenya yet

* Regulatory clarity still forming
* Market education required
* Infrastructure + liquidity gaps
* Few developer teams focused on compliant tokenization

FractionHome aims to bridge these gaps starting with a developer-friendly, transparent, well-architected Avalanche MVP.
