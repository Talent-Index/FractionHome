## Pitch — FractionHome: Tokenizing Real Estate for Transparent, Low-Friction Ownership

### Purpose

FractionHome demonstrates how real estate can be transformed into divisible, tradable digital shares so anyone can see and verify fractional ownership on a public ledger. The MVP proves the technical flow—from property upload to Hedera Token Service (HTS) tokenization and simulated investor trades—without requiring user accounts or payment rails.

### Motivation

Real estate is illiquid, costly to co-own, and opaque. FractionHome tackles these frictions by:
- Making property ownership divisible and transferable at token-level granularity.
- Using a public ledger (Hedera) and mirror node data to provide auditable provenance and balances.
- Removing onboarding complexity (no login/registration) to focus on demonstrating core blockchain mechanics and regulatory-friendly proof-of-concept flows.

### What it shows

- End-to-end tokenization pipeline: property metadata → IPFS/File Service → HTS token creation.
- Simulated secondary market: treasury transfers to dummy investors and peer-to-peer transfers.
- Verifiable ownership dashboard powered by mirror node queries, proving tokens map directly to on-chain state.

### Why it matters

- Lowers barriers to understanding tokenized real assets for investors, partners, and regulators.
- Validates core technical building blocks before adding payments, KYC, or token economics.
- Provides a reproducible demo for hackathons, investor showcases, and early architecture validation.

### Ask / Next steps

- Use this demo to validate product-market fit and technical assumptions.
- Extend with payment rails, compliance workflows, and real investor onboarding once the on-chain model is accepted.

FractionHome is a focused, demonstrable step toward more liquid, transparent real-estate ownership using HTS and verifiable mirror-node data.

### Story

Why did the software engineer buy a house? To finally get root access to his own backyard.

Back in high school I stumbled across Rich Dad Poor Dad and got hooked on real estate. The idea stuck — own a slice of something tangible and let it work for you. I became a SWE, did the math, and laid out a 20‑year plan to buy my first property.

### Head‑turning stats (Kenya — illustrative)

- Market scale: Kenya real‑estate stock ≈ $300B (order of magnitude). Tokenizing 1% → ≈ $3B of tradable assets.  
- Nairobi focus: metro market ≈ $20–30B — even small penetration creates meaningful liquidity.  
- Reach: population ≈ 55M with ~35–40% urban — mobile‑first retail and diaspora investors reachable via M‑Pesa.  
- Small tickets: example — KSh70M (~$470k) property split into 100,000 tokens → ~KSh700 (~$5) per token — enables sub‑$5–$50 entry points.  
- Faster & cheaper: on‑chain settlement in seconds/minutes (vs weeks/months traditionally) and lower ops costs via programmable tokens.

Why it matters: these simple, illustrative figures show how fractional tokenization can turn illiquid property into accessible, liquid investments for everyday Kenyans and diaspora capital.

### Software is eating the world

# Where it has worked

####  The Paxos Trust Company “PAX G” (gold-backed token) lets investors hold digital tokens representing physical gold held in custody.
   

#### The BlackRock USD Institutional Digital Liquidity Fund (“BUIDL”) is a money-market-type tokenized fund – according to one source, its annual return through July 2024 was ~5.3% vs ~5.0% for a comparable traditional fund.
    

#### Real estate tokenization: e.g., the Aspen Digital project tokenized the luxury hotel St. Regis Aspen Resort in Colorado, issuing security tokens representing fractional ownership and raising ~$18 million.
    

# Why hasn't it worked in Kenya yet

-  Regulatory uncertainty & legal frameworks
-  Infrastructure, technical and market readiness
- Market size, investor participation, secondary market liquidity


#### 20‑year plan (the math)

<!-- - Timeline: 4 years college + 1 year job search/bootcamp + 15 years working as a SWE saving/investing = 20 years.
- Assumptions:
    - Average salary during saving years ≈ $80,000
    - Savings rate f = 20% → annual savings = $80,000 * 0.20 = $16,000
    - Conservative annual investment return r = 4%
    - Saving horizon n = 15 years
- Future value of the savings (15‑year annuity at 4%):
    - FV = 16,000 * ((1.04^15 − 1) / 0.04) ≈ 16,000 * 20.02 ≈ $320,320

Result: with these conservative numbers you’d accumulate roughly $320k in 15 years of disciplined saving and investing — enough for a meaningful down payment in many markets. That early curiosity from a high‑school book turned into a concrete, measurable path; FractionHome aims to make fractional ownership part of that same story for others. -->



- took much explaining
- Hedera mentioning how it will be implemented in our project.
- asset works one asset at a time 
- focus on what matters
