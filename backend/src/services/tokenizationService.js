import { ethers } from "ethers";
import PropertyModel from '../models/propertyModel.js';
import fs from "fs";
import path from "path";

const propertyModel = new PropertyModel();

// Avalanche C-Chain RPC (you may use your own)
const AVALANCHE_RPC = "https://api.avax.network/ext/bc/C/rpc";

// Operator wallet (payer + contract deployer)
const OPERATOR_PRIVATE_KEY = process.env.AVAX_OPERATOR_KEY;

const provider = new ethers.JsonRpcProvider(AVALANCHE_RPC);
const operatorWallet = new ethers.Wallet(OPERATOR_PRIVATE_KEY, provider);

// Load compiled Solidity contract (ABI + bytecode)
const contractPath = path.join(process.cwd(), "artifacts/contracts/PropertyToken.sol/PropertyToken.json");
const contractJson = JSON.parse(fs.readFileSync(contractPath));
const abi = contractJson.abi;
const bytecode = contractJson.bytecode;

async function createTreasuryForProperty(req, res, next) {
    try {
        const propertyId = req.params.id;
        if (!propertyId)
            return res.status(400).json({ error: "Missing property id" });

        const prop = await propertyModel.getPropertyById(propertyId);
        if (!prop)
            return res.status(404).json({ error: "Property not found" });

        if (prop.treasuryId) {
            return res.status(400).json({
                error: "Property already has a treasury",
                treasuryId: prop.treasuryId
            });
        }

        const initialSupply = Number(req.body?.initialSupply ?? 0);
        if (isNaN(initialSupply) || initialSupply < 0) {
            return res.status(400).json({ error: "Invalid initialSupply" });
        }

        // 1) Generate treasury wallet (just a private key)
        const treasuryWallet = ethers.Wallet.createRandom();
        const treasuryAddress = treasuryWallet.address;

        console.log("Treasury Private Key:", treasuryWallet.privateKey);
        console.log("Treasury Address:", treasuryAddress);

        // Operator pays gas, so treasury does not need AVAX

        // 2) Deploy ERC-20 token for the property
        const name = `Property-${propertyId}-Token`;
        const symbol = `PROP-${propertyId}`;

        const factory = new ethers.ContractFactory(abi, bytecode, operatorWallet);

        console.log("Deploying token...");

        const contract = await factory.deploy(
            name,
            symbol,
            initialSupply,
            treasuryAddress
        );

        await contract.waitForDeployment();

        const tokenAddress = await contract.getAddress();
        console.log("Token deployed at:", tokenAddress);

        // 3) Save to DB
        const updates = {
            treasuryId: treasuryAddress,
            treasuryKey: treasuryWallet.privateKey,
            tokenId: tokenAddress,
            tokenInitialSupply: initialSupply,
            tokenCreatedAt: new Date().toISOString(),
        };

        const updated = await propertyModel.updateProperty(propertyId, updates);

        return res.json({
            ok: true,
            property: updated || { ...prop, ...updates }
        });

    } catch (err) {
        next(err);
    }
}

export { createTreasuryForProperty };
