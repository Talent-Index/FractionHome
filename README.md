# FractionHome

### 🎯 **Goal**

The MVP shows how a property can be:

1. Uploaded to the system,
2. Tokenized on **Avalanche C‑Chain (ERC‑20)**,
3. Purchased fractionally by dummy investors, and
4. Displayed in a dashboard showing ownership distribution —  
  all **without login or registration**.

This is a **proof‑of‑concept** demo focused on the *core blockchain logic*, not user management.

---

## 👥 **Roles (All Dummy Accounts)**

| Role           | Purpose                                   | Represented As                 |
| -------------- | ----------------------------------------- | ------------------------------ |
| **Owner**      | Uploads property & initiates tokenization | Hardcoded dummy Avalanche EVM address |
| **Investor A** | Buys property tokens                      | Dummy Avalanche EVM address    |
| **Investor B** | Holds or transfers tokens                 | Dummy Avalanche EVM address    |

All accounts are stored in `.env` with their respective `address` and `private_key` for fuji/testnet operations.

---

## ⚙️ **System Workflow**

### **Step 1: Property Upload**

* The **Owner** fills a simple form:
  → property name, location, price, and image.
* The image is uploaded to **IPFS (or other off‑chain storage)**.
* Metadata is stored locally (JSON or SQLite).

➡️ *Result:* Property added to system, ready for tokenization.

---

### **Step 2: Tokenization**

* Owner clicks **“Tokenize Property”**.
* Backend deploys or mints an ERC‑20 token on the **Avalanche C‑Chain** using a Web3 provider (e.g., ethers.js).
  * Example: 10,000 tokens = 100% of the property.
* Transaction details and token contract address are displayed on the UI.

➡️ *Result:* The property is now a blockchain asset (ERC‑20) with tradable shares.

---

### **Step 3: Buy Tokens (Simulated)**

* Investors choose how many tokens they want.
* A dummy purchase flow transfers ERC‑20 tokens from the **owner’s treasury** to the **investor’s address** via a standard token transfer call.
* Payment is simulated — no fiat integration yet.

➡️ *Result:* Ownership of property fractions changes on the Avalanche network.

---

### **Step 4: Ownership Dashboard**

* Users can view a dashboard showing:

  * Property info
  * Token contract address
  * Ownership distribution (who holds how many tokens)
* Balances are fetched from the Avalanche C‑Chain via RPC (ethers.js provider) or block explorer API (e.g., SnowTrace) for verification.

➡️ *Result:* Transparent on‑chain record of property ownership.

---

### **Step 5 (Optional): Token Transfers**

* Investors can transfer some tokens to others (e.g., Investor A → Investor B).
* Demonstrates secondary market movement.

➡️ *Result:* Realistic simulation of asset liquidity.

---

## 🧩 **App Components**

### **Frontend (React)**

| Component            | Function                                     |
| -------------------- | -------------------------------------------- |
| `UploadForm`         | Property upload and image submission         |
| `TokenizeButton`     | Trigger ERC‑20 contract deploy/mint          |
| `BuyForm`            | Simulate token purchase                      |
| `OwnershipDashboard` | Display ownership breakdown from chain RPC   |

---

### **Backend (Node.js + Express)**

| Endpoint                            | Description                        |
| ----------------------------------- | ---------------------------------- |
| `POST /api/properties/upload`       | Handles property creation          |
| `POST /api/properties/:id/tokenize` | Deploys/mints ERC‑20 token         |
| `POST /api/properties/:id/buy`      | Transfers tokens to dummy investor |
| `GET /api/properties/:id/holders`   | Queries chain for balances         |

Uses `ethers` (or `web3`) for ERC‑20 operations and local JSON/SQLite for metadata.

---

## ☁️ **Infrastructure Diagram**

```
[ React Frontend ]
       ↓
[ Node.js API ]
   ├── Property Storage (local JSON / SQLite)
   ├── Avalanche C-Chain (ERC-20 via ethers.js)
   └── IPFS (image storage)
```

---

## 🔑 **Example Environment Variables**

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
2. Clicks **Tokenize** → ERC‑20 contract deploys / mint transaction executes on Avalanche.
3. Investor buys tokens → transfer happens.
4. Dashboard updates showing token distribution.

This creates a **clear, verifiable tokenized property demo** — perfect for showing investors, hackathon judges, or a product prototype.



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
