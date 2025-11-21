<<<<<<< HEAD
# 🏗️ **FractionHome**

###  **MVP Architecture Overview**
=======
# FractionHome
>>>>>>> f5105f0387d5faad631f94586b89c68148c8c433

### 🎯 **Goal**

The MVP shows how a property can be:

1. Uploaded to the system,
<<<<<<< HEAD
2. Tokenized on **Avalanche (C‑Chain, EVM)**,
=======
2. Tokenized on **Avalanche C‑Chain (ERC‑20)**,
>>>>>>> f5105f0387d5faad631f94586b89c68148c8c433
3. Purchased fractionally by dummy investors, and
4. Displayed in a dashboard showing ownership distribution —  
  all **without login or registration**.

This is a **proof‑of‑concept** demo focused on the *core blockchain logic*, not user management.

---

##  **Roles (All Dummy Accounts)**

<<<<<<< HEAD
| Role           | Purpose                                   | Represented As                         |
| -------------- | ----------------------------------------- | -------------------------------------- |
| **Owner**      | Uploads property & initiates tokenization | Hardcoded dummy Avalanche C‑Chain address |
| **Investor A** | Buys property tokens                      | Dummy Avalanche C‑Chain address        |
| **Investor B** | Holds or transfers tokens                 | Dummy Avalanche C‑Chain address        |

All accounts are stored in `.env` with their respective `address` and `private_key` for testnet operations.
=======
| Role           | Purpose                                   | Represented As                 |
| -------------- | ----------------------------------------- | ------------------------------ |
| **Owner**      | Uploads property & initiates tokenization | Hardcoded dummy Avalanche EVM address |
| **Investor A** | Buys property tokens                      | Dummy Avalanche EVM address    |
| **Investor B** | Holds or transfers tokens                 | Dummy Avalanche EVM address    |

All accounts are stored in `.env` with their respective `address` and `private_key` for fuji/testnet operations.
>>>>>>> f5105f0387d5faad631f94586b89c68148c8c433

---

## **System Workflow**

### **Step 1: Property Upload**

* The **Owner** fills a simple form:
  → property name, location, price, and image.
<<<<<<< HEAD
* The image is uploaded to **IPFS (or a file service)**.
=======
* The image is uploaded to **IPFS (or other off‑chain storage)**.
>>>>>>> f5105f0387d5faad631f94586b89c68148c8c433
* Metadata is stored locally (JSON or SQLite).

*Result:* Property added to system, ready for tokenization.

---

### **Step 2: Tokenization**

* Owner clicks **“Tokenize Property”**.
<<<<<<< HEAD
* Backend deploys or interacts with an ERC‑20 (fungible) token contract on **Avalanche C‑Chain (EVM)**.

  * Example: 10,000 tokens = 100% of the property.
* Transaction details and token contract address are displayed on the UI.

*Result:* The property is now a blockchain asset with tradable shares on Avalanche.
=======
* Backend deploys or mints an ERC‑20 token on the **Avalanche C‑Chain** using a Web3 provider (e.g., ethers.js).
  * Example: 10,000 tokens = 100% of the property.
* Transaction details and token contract address are displayed on the UI.

➡️ *Result:* The property is now a blockchain asset (ERC‑20) with tradable shares.
>>>>>>> f5105f0387d5faad631f94586b89c68148c8c433

---

### **Step 3: Buy Tokens (Simulated)**

* Investors choose how many tokens they want.
<<<<<<< HEAD
* A dummy purchase flow transfers ERC‑20 tokens from the **owner’s treasury** to the **investor’s address** using standard token transfer calls.
* Payment is simulated — no fiat integration yet.

*Result:* Ownership of property fractions changes on the Avalanche C‑Chain.
=======
* A dummy purchase flow transfers ERC‑20 tokens from the **owner’s treasury** to the **investor’s address** via a standard token transfer call.
* Payment is simulated — no fiat integration yet.

➡️ *Result:* Ownership of property fractions changes on the Avalanche network.
>>>>>>> f5105f0387d5faad631f94586b89c68148c8c433

---

### **Step 4: Ownership Dashboard**

* Users can view a dashboard showing:

  * Property info
  * Token contract address
  * Ownership distribution (who holds how many tokens)
<<<<<<< HEAD
* Data fetched from an Avalanche C‑Chain RPC, indexer, or block explorer API (e.g., SnowTrace) for verification.

*Result:* Transparent on‑chain record of property ownership.
=======
* Balances are fetched from the Avalanche C‑Chain via RPC (ethers.js provider) or block explorer API (e.g., SnowTrace) for verification.

➡️ *Result:* Transparent on‑chain record of property ownership.
>>>>>>> f5105f0387d5faad631f94586b89c68148c8c433

---

### **Step 5 (Optional): Token Transfers**

* Investors can transfer some tokens to others (e.g., Investor A → Investor B).
* Demonstrates secondary market movement.

 *Result:* Realistic simulation of asset liquidity.

---

## **App Components**

### **Frontend (React)**

| Component            | Function                                     |
| -------------------- | -------------------------------------------- |
| `UploadForm`         | Property upload and image submission         |
<<<<<<< HEAD
| `TokenizeButton`     | Trigger ERC‑20 contract deployment/minting   |
| `BuyForm`            | Simulate token purchase                      |
| `OwnershipDashboard` | Display ownership breakdown from chain/indexer |
=======
| `TokenizeButton`     | Trigger ERC‑20 contract deploy/mint          |
| `BuyForm`            | Simulate token purchase                      |
| `OwnershipDashboard` | Display ownership breakdown from chain RPC   |
>>>>>>> f5105f0387d5faad631f94586b89c68148c8c433

---

### **Backend (Node.js + Express)**

<<<<<<< HEAD
| Endpoint                            | Description                                |
| ----------------------------------- | ------------------------------------------ |
| `POST /api/properties/upload`       | Handles property creation                  |
| `POST /api/properties/:id/tokenize` | Deploys/mints ERC‑20 token on Avalanche    |
| `POST /api/properties/:id/buy`      | Transfers tokens to dummy investor         |
| `GET /api/properties/:id/holders`   | Queries chain/indexer for balances         |

Uses `ethers.js` (or `web3.js`) for ERC‑20 interactions and local JSON/SQLite for metadata.
=======
| Endpoint                            | Description                        |
| ----------------------------------- | ---------------------------------- |
| `POST /api/properties/upload`       | Handles property creation          |
| `POST /api/properties/:id/tokenize` | Deploys/mints ERC‑20 token         |
| `POST /api/properties/:id/buy`      | Transfers tokens to dummy investor |
| `GET /api/properties/:id/holders`   | Queries chain for balances         |

Uses `ethers` (or `web3`) for ERC‑20 operations and local JSON/SQLite for metadata.
>>>>>>> f5105f0387d5faad631f94586b89c68148c8c433

---

## **Infrastructure Diagram**

```
[ React Frontend ]
       ↓
[ Node.js API ]
   ├── Property Storage (local JSON / SQLite)
<<<<<<< HEAD
   ├── Ethers.js (ERC‑20 deploy/mint/transfer on Avalanche C‑Chain)
=======
   ├── Avalanche C-Chain (ERC-20 via ethers.js)
>>>>>>> f5105f0387d5faad631f94586b89c68148c8c433
   └── IPFS (image storage)
```

---

## **Example Environment Variables**

```bash
OWNER_ADDRESS=0xAbC123...
<<<<<<< HEAD
OWNER_KEY=0x302e02...
INVESTOR_A_ADDRESS=0xDeF456...
INVESTOR_A_KEY=0x302e02...
INVESTOR_B_ADDRESS=0x789GhI...
INVESTOR_B_KEY=0x302e02...
AVALANCHE_NETWORK=fuji
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
=======
OWNER_PRIVATE_KEY=0xabcdef...
INVESTOR_A_ADDRESS=0xDef456...
INVESTOR_A_PRIVATE_KEY=0x123456...
INVESTOR_B_ADDRESS=0x789AbC...
INVESTOR_B_PRIVATE_KEY=0x789abc...
AVALANCHE_NETWORK=fuji
AVALANCHE_RPC=https://api.avax-test.network/ext/bc/C/rpc
>>>>>>> f5105f0387d5faad631f94586b89c68148c8c433
```

---

## **Demo Flow Summary**

1. Owner uploads a property.
<<<<<<< HEAD
2. Clicks **Tokenize** → ERC‑20 contract is deployed or minted on Avalanche C‑Chain.
=======
2. Clicks **Tokenize** → ERC‑20 contract deploys / mint transaction executes on Avalanche.
>>>>>>> f5105f0387d5faad631f94586b89c68148c8c433
3. Investor buys tokens → transfer happens.
4. Dashboard updates showing token distribution.

This creates a **clear, verifiable tokenized property demo** — perfect for showing investors, hackathon judges, or a product prototype.

<<<<<<< HEAD
---

## Unique features
- Snapshot NFT Receipts — Turns transfers into verifiable, shareable deeds (mint a receipt NFT for each transfer).
- Satellite + Geo‑Overlay — Visual proof of where you own: map overlays and satellite imagery tied to the property coordinates.
- AI Property Summary — Smart auto‑description generated from metadata and images so owners avoid manual typing.
- One‑Click Chain Explorer — Instant on‑chain verification links and human‑friendly views, no crypto knowledge required.
- Fractional Ownership Game — Gamified onboarding to make fractional ownership engaging and memorable.
- No‑Wallet UX — Local custody or custodial flows so the experience feels like a regular app, not a blockchain experiment.

=======


# Avalanche IPFS Property Backend (MVP)


This project demonstrates how to persist property media and canonical metadata to immutable off‑chain storage (IPFS) and keep compact, verifiable references on‑chain (or in this case, locally recorded CIDs). It satisfies the acceptance checklist for an MVP.


## What it does
* Uploads media files to IPFS (supports ipfs-http-client or Pinata)
* Builds canonical metadata JSON containing media CIDs and SHA-256 hash
* Uploads canonical metadata JSON to IPFS
* Stores a compact local record: `{ id, metadataCid, canonicalHash }`
* Exposes endpoints to upload, list, and verify metadata


## How to run
1. Copy `.env.example` to `.env` and set provider values.
2. `npm install` (dependencies: express, ipfs-http-client, multer, lowdb, axios, pino, dotenv, uuid, ethers)
3. `node src/server.js`


## Endpoints
* `POST /api/properties` - multipart/form-data `files[]` + additional form fields -> returns record
* `GET /api/properties` - list
* `GET /api/properties/:id` - get specific record
* `POST /api/properties/:id/tokenize` - deploy/mint ERC‑20 token for property
* `POST /api/properties/:id/buy` - transfer tokens from owner to investor
* `GET /api/properties/:id/holders` - get token balances for property token


FractionHome/
├── backend/
│   ├── db.json
│   ├── avalanche.js
│   ├── package.json
│   ├── server.js
│   ├── README.md
│   ├── .env.example
│   ├── uploads/                 # created dynamically when uploading files
│   └── public/
│       └── media/               # uploaded images stored here
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── README.md
│   ├── node_modules/
│   └── src/
│       ├── App.jsx              # simple React UI
│       ├── main.jsx
│       └── assets/
│
├── docs/
│   └── demo.md                  # short usage notes
│
├── scripts/
│   ├── start-backend.sh         # helper to run backend in dev mode
│   └── demo-api.sh              # test script to upload & list properties
│
├── .gitignore
└── README.md                    # project overview
>>>>>>> f5105f0387d5faad631f94586b89c68148c8c433
