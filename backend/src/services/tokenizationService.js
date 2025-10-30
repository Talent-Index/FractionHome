import { PrivateKey, AccountCreateTransaction, TokenCreateTransaction, Hbar, TokenType, TokenSupplyType } from '@hashgraph/sdk';
import HederaClient from '../config/hederaClient.js';
import PropertyModel from '../models/propertyModel.js';

const propertyModel = new PropertyModel();
const hederaClient = new HederaClient();
const client = hederaClient.getClient();

async function createTreasuryForProperty(req, res, next) {
    try {
        const propertyId = req.params.id;
        if (!propertyId) return res.status(400).json({ error: 'Missing property id' });

        const prop = await propertyModel.getPropertyById(propertyId);
        if (!prop) return res.status(404).json({ error: 'Property not found' });

        if (prop.treasuryId) {
            return res.status(400).json({ error: 'Property already has a treasury', treasuryId: prop.treasuryId });
        }

        const initialSupply = Number(req.body && req.body.initialSupply ? req.body.initialSupply : 0);
        if (Number.isNaN(initialSupply) || initialSupply < 0) {
            return res.status(400).json({ error: 'Invalid initialSupply' });
        }

        // 1) generate treasury keypair
        const treasuryKey = PrivateKey.generateECDSA();
        console.log("Treasury Private Key:", treasuryKey.toString());

        // 2) create treasury account - Use standard approach with proper signing
        const operatorKey = hederaClient.getOperatorKey();
        
        const acctTx = new AccountCreateTransaction()
            .setKey(treasuryKey.publicKey)
            .setInitialBalance(new Hbar(1))
            .freezeWith(client);

        // Sign with operator key (pays for transaction)
        const signedAcctTx = await acctTx.sign(operatorKey);
        const acctResponse = await signedAcctTx.execute(client);
        
        const acctReceipt = await acctResponse.getReceipt(client);
        const treasuryId = acctReceipt.accountId.toString();
        console.log("Created treasury account:", treasuryId);

        // 3) create fungible token
        const tokenTx = new TokenCreateTransaction()
            .setTokenName(`Property-${propertyId}-Token`)
            .setTokenSymbol(`PROP-${propertyId}`)
            .setTokenType(TokenType.FungibleCommon)
            .setDecimals(0)
            .setInitialSupply(initialSupply)
            .setTreasuryAccountId(treasuryId)
            .setSupplyType(TokenSupplyType.Finite)
            .setMaxSupply(initialSupply)
            .setAdminKey(operatorKey.publicKey)
            .setSupplyKey(operatorKey.publicKey)
            .freezeWith(client);

        // Sign with both operator and treasury keys
        const signedTokenTx = await (await tokenTx.sign(operatorKey)).sign(treasuryKey);
        const tokenResp = await signedTokenTx.execute(client);
        const tokenReceipt = await tokenResp.getReceipt(client);
        const tokenId = tokenReceipt.tokenId.toString();

        // 4) update property record
        const updates = {
            treasuryId,
            treasuryKey: treasuryKey.toString(),
            tokenId,
            tokenInitialSupply: initialSupply,
            tokenCreatedAt: new Date().toISOString(),
        };

        const updated = await propertyModel.updateProperty(propertyId, updates);

        return res.json({ ok: true, property: updated || { ...prop, ...updates } });
    } catch (err) {
        next(err);
    }
}

export { createTreasuryForProperty };