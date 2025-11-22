## **FractionHome MVP Architecture Overview**

### **Goal**

The MVP shows how a property can be:

1. Uploaded to the system,
2. Tokenized on **Hedera Hashgraph (HTS)**,
3. Purchased fractionally by dummy investors, and
4. Displayed in a dashboard showing ownership distribution —
   all **without login or registration**.

This is a **proof-of-concept** demo focused on the *core blockchain logic*, not user management.

---

## 👥 **Roles (All Dummy Accounts)**

| Role           | Purpose                                   | Represented As                 |
| -------------- | ----------------------------------------- | ------------------------------ |
| **Owner**      | Uploads property & initiates tokenization | Hardcoded dummy Hedera account |
| **Investor A** | Buys property tokens                      | Dummy Hedera account           |
| **Investor B** | Holds or transfers tokens                 | Dummy Hedera account           |

All accounts are stored in `.env` with their respective `account_id` and `private_key` for testnet operations.

---

## **System Workflow**

### **Step 1: Property Upload**

* The **Owner** fills a simple form:
  → property name, location, price, and image.
* The image is uploaded to **IPFS (or Hedera File Service)**.
* Metadata is stored locally (JSON or SQLite).

 *Result:* Property added to system, ready for tokenization.

---

### **Step 2: Tokenization**

* Owner clicks **“Tokenize Property”**.
* Backend calls **Hedera Token Service (HTS)** to create a fungible token.

  * Example: 10,000 tokens = 100% of the property.
* Transaction details and token ID are displayed on the UI.

 *Result:* The property is now a blockchain asset with tradable shares.

---

### **Step 3: Buy Tokens (Simulated)**

* Investors choose how many tokens they want.
* A dummy purchase flow transfers tokens from the **owner’s treasury** to the **investor’s account** using HTS.
* Payment is simulated — no fiat integration yet.

*Result:* Ownership of property fractions changes on the Hedera network.

---

### **Step 4: Ownership Dashboard**

* Users can view a dashboard showing:

  * Property info
  * Token ID
  * Ownership distribution (who holds how many tokens)
* Data fetched from the **Hedera Mirror Node** for verification.

 *Result:* Transparent on-chain record of property ownership.

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
| `TokenizeButton`     | Trigger HTS token creation                   |
| `BuyForm`            | Simulate token purchase                      |
| `OwnershipDashboard` | Display ownership breakdown from mirror node |

---

### **Backend (Node.js + Express)**

| Endpoint                            | Description                        |
| ----------------------------------- | ---------------------------------- |
| `POST /api/properties/upload`       | Handles property creation          |
| `POST /api/properties/:id/tokenize` | Mints new Hedera token             |
| `POST /api/properties/:id/buy`      | Transfers tokens to dummy investor |
| `GET /api/properties/:id/holders`   | Queries mirror node for balances   |

Uses `hedera-sdk-js` for HTS operations and local JSON/SQLite for metadata.

---

## **Infrastructure Diagram**

```
[ React Frontend ]
       ↓
[ Node.js API ]
   ├── Property Storage (local JSON / SQLite)
   ├── Hedera SDK (HTS mint/transfer)
   └── IPFS (image storage)
```

---

##  **Example Environment Variables**

```bash
OWNER_ID=0.0.12345
OWNER_KEY=302e0201...
INVESTOR_A_ID=0.0.67890
INVESTOR_A_KEY=302e0201...
INVESTOR_B_ID=0.0.13579
INVESTOR_B_KEY=302e0201...
HEDERA_NETWORK=testnet
```

---

## **Demo Flow Summary**

1. Owner uploads a property.
2. Clicks **Tokenize** → Hedera transaction executes.
3. Investor buys tokens → transfer happens.
4. Dashboard updates showing token distribution.

This creates a **clear, verifiable tokenized property demo** — perfect for showing investors, hackathon judges, or a product prototype.
