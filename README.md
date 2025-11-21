# 🏗️ **FractionHome**

## **MVP Architecture Overview**

### 🎯 **Goal**

The MVP demonstrates how a property can be:

1. Uploaded to the system,
2. Tokenized on **Avalanche C‑Chain (ERC‑20)**,
3. Purchased fractionally by dummy investors, and
4. Displayed in a dashboard showing ownership distribution — all **without login or registration**.

This is a **proof‑of‑concept** focused purely on *core blockchain logic*, not user management.

---

## 👥 **Roles (All Dummy Accounts)**

| Role           | Purpose                                   | Represented As                  |
| -------------- | ----------------------------------------- | ------------------------------- |
| **Owner**      | Uploads property & initiates tokenization | Hardcoded Avalanche EVM address |
| **Investor A** | Buys property tokens                      | Dummy Avalanche EVM address     |
| **Investor B** | Holds or transfers tokens                 | Dummy Avalanche EVM address     |

All accounts are stored in `.env` with their respective `address` and `private_key` for Fuji testnet operations.

---

## ⚙️ **System Workflow**

### **Step 1: Property Upload**

* The **Owner** fills in a simple form: property name, location, price, and image.
* Image uploads to **IPFS (or other off‑chain storage)**.
* Metadata is stored locally (JSON or SQLite).

**Result:** Property is now in the system and ready for tokenization.

---

### **Step 2: Tokenization**

* Owner clicks **Tokenize Property**.
* Backend deploys or mints an **ERC‑20 token** on the Avalanche C‑Chain.
* Example allocation: **10,000 tokens = 100% ownership**.
* UI displays token contract address and transaction details.

**Result:** The property becomes a blockchain asset with tradable fractional shares.

---

### **Step 3: Buy Tokens (Simulated)**

* Investors choose how many tokens they want.
* Dummy purchase flow transfers ERC‑20 tokens from the **Owner’s treasury** to the **Investor’s wallet**.
* Payment is simulated — no fiat or crypto payment processing.

**Result:** Actual ERC‑20 token balances update on Avalanche testnet.

---

### **Step 4: Ownership Dashboard**

The dashboard displays:

* Property information
* Token contract address
* Ownership distribution (ERC‑20 balances per address)

Balances fetched from Avalanche RPC or SnowTrace API.

**Result:** Clear, transparent on‑chain record of fractional ownership.

---

### **Step 5 (Optional): Token Transfers)**

* Investors can transfer tokens to each other (e.g., A → B).

**Result:** Shows realistic fractional liquidity.

---

## 🧩 **App Components**

### **Frontend (React)**

| Component            | Function                             |
| -------------------- | ------------------------------------ |
| `UploadForm`         | Upload property & image              |
| `TokenizeButton`     | Deploy/mint ERC‑20 token             |
| `BuyForm`            | Simulate token purchase              |
| `OwnershipDashboard` | Display token ownership distribution |

---

### **Backend (Node.js + Express)**

| Endpoint                            | Description                            |
| ----------------------------------- | -------------------------------------- |
| `POST /api/properties/upload`       | Upload property + media                |
| `POST /api/properties/:id/tokenize` | Deploy/mint ERC‑20 token               |
| `POST /api/properties/:id/buy`      | Transfer tokens from Owner to Investor |
| `GET /api/properties/:id/holders`   | Fetch balances from Avalanche RPC      |

Backend uses **ethers.js** + local JSON/SQLite.

---

## ☁️ **Infrastructure Diagram**

```
[ React Frontend ]
       ↓
[ Node.js API ]
   ├── Property Storage (JSON / SQLite)
   ├── Avalanche C‑Chain ERC‑20 via ethers.js
   └── IPFS (image storage)
```

---

## 🔑 **Environment Variables Example**

```bash
OWNER_ADDRESS=0xAbC123...
OWNER_PRIVATE_KEY=0xabcdef...
INVESTOR_A_ADDRESS=0xDef456...
INVESTOR_A_PRIVATE_KEY=0x123456...
INVESTOR_B_ADDRESS=0x789AbC...
INVESTOR_B_PRIVATE_KEY=0x789abc...
AVALANCHE_NETWORK=fuji
AVALANCHE_RPC=https://api.avax-test.network/ext/bc/C/rpc
```

---

## 🚀 **Demo Flow Summary**

1. Owner uploads a property.
2. Owner clicks **Tokenize**, deploying an ERC‑20 token.
3. Investors buy fractions (token transfers occur).
4. Dashboard displays dynamic, on‑chain ownership.

A clear, verifiable **tokenized real‑estate demo** — ideal for investors, hackathons, and prototypes.

---

## ⭐ Unique Features

* **Snapshot NFT Receipts** — Mint receipt NFTs for every transfer.
* **Satellite + Geo‑Overlay** — Visual location proof tied to coordinates.
* **AI Property Summary** — Auto‑generated descriptions from metadata.
* **One‑Click Explorer View** — Human‑friendly on‑chain verification.
* **Fractional Ownership Game** — Gamified onboarding.
* **No‑Wallet UX** — Local/custodial flows for Web2‑smooth experience.

---

# Avalanche IPFS Property Backend (MVP)

A backend for storing immutable property metadata on IPFS and referencing it locally.

## Features

* Upload media to IPFS (ipfs‑http‑client or Pinata)
* Build canonical metadata JSON
* Upload metadata JSON to IPFS
* Store `{ id, metadataCid, canonicalHash }` locally
* Endpoints for upload, list, view, tokenize, buy, and holders

## Project Structure

```
FractionHome/
├── backend/
│   ├── db.json
│   ├── avalanche.js
│   ├── package.json
│   ├── server.js
│   ├── README.md
│   ├── .env.example
│   ├── uploads/
│   └── public/media/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── README.md
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── assets/
├── docs/
│   └── demo.md
├── scripts/
│   ├── start-backend.sh
│   └── demo-api.sh
└── README.md
```
