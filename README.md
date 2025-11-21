# 🏗️ **FractionHome**

###  **MVP Architecture Overview**

### 🎯 **Goal**

The MVP shows how a property can be:

1. Uploaded to the system,
2. Tokenized on **Avalanche (C‑Chain, EVM)**,
3. Purchased fractionally by dummy investors, and
4. Displayed in a dashboard showing ownership distribution —  
  all **without login or registration**.

This is a **proof-of-concept** demo focused on the *core blockchain logic*, not user management.

---

##  **Roles (All Dummy Accounts)**

| Role           | Purpose                                   | Represented As                         |
| -------------- | ----------------------------------------- | -------------------------------------- |
| **Owner**      | Uploads property & initiates tokenization | Hardcoded dummy Avalanche C‑Chain address |
| **Investor A** | Buys property tokens                      | Dummy Avalanche C‑Chain address        |
| **Investor B** | Holds or transfers tokens                 | Dummy Avalanche C‑Chain address        |

All accounts are stored in `.env` with their respective `address` and `private_key` for testnet operations.

---

## **System Workflow**

### **Step 1: Property Upload**

* The **Owner** fills a simple form:
  → property name, location, price, and image.
* The image is uploaded to **IPFS (or a file service)**.
* Metadata is stored locally (JSON or SQLite).

*Result:* Property added to system, ready for tokenization.

---

### **Step 2: Tokenization**

* Owner clicks **“Tokenize Property”**.
* Backend deploys or interacts with an ERC‑20 (fungible) token contract on **Avalanche C‑Chain (EVM)**.

  * Example: 10,000 tokens = 100% of the property.
* Transaction details and token contract address are displayed on the UI.

*Result:* The property is now a blockchain asset with tradable shares on Avalanche.

---

### **Step 3: Buy Tokens (Simulated)**

* Investors choose how many tokens they want.
* A dummy purchase flow transfers ERC‑20 tokens from the **owner’s treasury** to the **investor’s address** using standard token transfer calls.
* Payment is simulated — no fiat integration yet.

*Result:* Ownership of property fractions changes on the Avalanche C‑Chain.

---

### **Step 4: Ownership Dashboard**

* Users can view a dashboard showing:

  * Property info
  * Token contract address
  * Ownership distribution (who holds how many tokens)
* Data fetched from an Avalanche C‑Chain RPC, indexer, or block explorer API (e.g., SnowTrace) for verification.

*Result:* Transparent on‑chain record of property ownership.

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
| `TokenizeButton`     | Trigger ERC‑20 contract deployment/minting   |
| `BuyForm`            | Simulate token purchase                      |
| `OwnershipDashboard` | Display ownership breakdown from chain/indexer |

---

### **Backend (Node.js + Express)**

| Endpoint                            | Description                                |
| ----------------------------------- | ------------------------------------------ |
| `POST /api/properties/upload`       | Handles property creation                  |
| `POST /api/properties/:id/tokenize` | Deploys/mints ERC‑20 token on Avalanche    |
| `POST /api/properties/:id/buy`      | Transfers tokens to dummy investor         |
| `GET /api/properties/:id/holders`   | Queries chain/indexer for balances         |

Uses `ethers.js` (or `web3.js`) for ERC‑20 interactions and local JSON/SQLite for metadata.

---

## **Infrastructure Diagram**

```
[ React Frontend ]
       ↓
[ Node.js API ]
   ├── Property Storage (local JSON / SQLite)
   ├── Ethers.js (ERC‑20 deploy/mint/transfer on Avalanche C‑Chain)
   └── IPFS (image storage)
```

---

## **Example Environment Variables**

```bash
OWNER_ADDRESS=0xAbC123...
OWNER_KEY=0x302e02...
INVESTOR_A_ADDRESS=0xDeF456...
INVESTOR_A_KEY=0x302e02...
INVESTOR_B_ADDRESS=0x789GhI...
INVESTOR_B_KEY=0x302e02...
AVALANCHE_NETWORK=fuji
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
```

---

## **Demo Flow Summary**

1. Owner uploads a property.
2. Clicks **Tokenize** → ERC‑20 contract is deployed or minted on Avalanche C‑Chain.
3. Investor buys tokens → transfer happens.
4. Dashboard updates showing token distribution.

This creates a **clear, verifiable tokenized property demo** — perfect for showing investors, hackathon judges, or a product prototype.

---

## Unique features
- Snapshot NFT Receipts — Turns transfers into verifiable, shareable deeds (mint a receipt NFT for each transfer).
- Satellite + Geo‑Overlay — Visual proof of where you own: map overlays and satellite imagery tied to the property coordinates.
- AI Property Summary — Smart auto‑description generated from metadata and images so owners avoid manual typing.
- One‑Click Chain Explorer — Instant on‑chain verification links and human‑friendly views, no crypto knowledge required.
- Fractional Ownership Game — Gamified onboarding to make fractional ownership engaging and memorable.
- No‑Wallet UX — Local custody or custodial flows so the experience feels like a regular app, not a blockchain experiment.

