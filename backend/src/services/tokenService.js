// services/avalancheTokenService.js
import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import logger from '../config/logger.js';
import PropertyModel from '../models/propertyModel.js';

const propertyModel = new PropertyModel();

// ---------- Configuration ----------
const AVALANCHE_RPC = process.env.AVALANCHE_RPC || 'https://api.avax.network/ext/bc/C/rpc';
const OPERATOR_PRIVATE_KEY = process.env.AVAX_OPERATOR_KEY;
if (!OPERATOR_PRIVATE_KEY) {
  logger.warn('AVAX_OPERATOR_KEY not set - deploy/mint operations will fail without an operator private key.');
}

const GLOBAL_TREASURY_ADDRESS = process.env.TREASURY_ADDRESS || null;
const GLOBAL_TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY || null;

// Compiled contract artifact (assumes Hardhat / Truffle output)
const CONTRACT_ARTIFACT_PATH = path.join(process.cwd(), 'artifacts', 'contracts', 'PropertyToken.sol', 'PropertyToken.json');
if (!fs.existsSync(CONTRACT_ARTIFACT_PATH)) {
  logger.error(`Contract artifact not found at ${CONTRACT_ARTIFACT_PATH}. Compile your contract first.`);
}
const contractJson = fs.existsSync(CONTRACT_ARTIFACT_PATH) ? JSON.parse(fs.readFileSync(CONTRACT_ARTIFACT_PATH, 'utf8')) : null;
const ABI = contractJson ? contractJson.abi : null;
const BYTECODE = contractJson ? contractJson.bytecode : null;

// ---------- Provider + Operator ----------
const provider = new ethers.JsonRpcProvider(AVALANCHE_RPC);
const operatorWallet = OPERATOR_PRIVATE_KEY ? new ethers.Wallet(OPERATOR_PRIVATE_KEY, provider) : null;

// ---------- Helpers ----------
function _requireProvider() {
  if (!provider) throw new Error('Avalanche provider not configured');
  return provider;
}

function _requireAbiBytecode() {
  if (!ABI || !BYTECODE) {
    throw new Error(`Contract ABI/bytecode not available. Expected artifact at: ${CONTRACT_ARTIFACT_PATH}`);
  }
  return { ABI, BYTECODE };
}

/**
 * Resolve a treasury address + private key.
 * Priority: explicit args > global env. Throws if address missing.
 * Returns { address: '0x...', privateKey: '0x...' | null }
 */
function _resolveTreasury(treasuryAddress, treasuryPrivateKey, operationName) {
  let addr = treasuryAddress || null;
  let pk = treasuryPrivateKey || null;

  if (!addr && GLOBAL_TREASURY_ADDRESS) {
    addr = GLOBAL_TREASURY_ADDRESS;
    pk = pk || GLOBAL_TREASURY_PRIVATE_KEY;
  }

  if (!addr) {
    throw new Error(`Treasury address required for ${operationName}. Provide treasuryAddress explicitly or set TREASURY_ADDRESS.`);
  }

  // normalize to checksum address if possible
  try {
    addr = ethers.getAddress(addr);
  } catch (err) {
    // allow non-checksummed but try to keep it consistent
    logger.warn(`Invalid or non-checksummed address provided for ${operationName}: ${addr}`);
  }

  return { treasuryAddress: addr, treasuryPrivateKey: pk ?? null };
}

// ---------- Public service methods (same exported names) ----------

/**
 * Create an ERC-20 token for a property and assign initial supply to a newly generated or resolved treasury.
 *
 * payload:
 *   - propertyId
 *   - name
 *   - symbol
 *   - initialSupply (number or string)
 *   - decimals (default 0)
 *   - treasuryAddress (optional)
 *   - treasuryPrivateKey (optional)
 */
async function createToken(payload = {}) {
  const provider = _requireProvider();
  const { ABI, BYTECODE } = _requireAbiBytecode();

  const {
    propertyId,
    name,
    symbol,
    initialSupply,
    decimals = 0,
    treasuryAddress,
    treasuryPrivateKey
  } = payload;

  if (!propertyId || !name || !symbol || initialSupply == null) {
    throw new Error('Missing required fields: propertyId, name, symbol, initialSupply');
  }

  // ensure property exists
  const property = await propertyModel.getPropertyById(propertyId);
  if (!property) throw new Error(`Property not found: ${propertyId}`);

  // If already tokenized (we treat presence of treasuryId & tokenId as tokenized)
  if (property.treasuryId && property.tokenId) {
    logger.info(`Property ${propertyId} already tokenized: treasury=${property.treasuryId}, token=${property.tokenId}`);
    return { alreadyTokenized: true, property };
  }

  // Resolve (or generate) treasury wallet
  let resolved = null;
  if (treasuryAddress || treasuryPrivateKey) {
    resolved = _resolveTreasury(treasuryAddress, treasuryPrivateKey, 'token creation');
  } else if (property.treasuryId && property.treasuryKey) {
    resolved = _resolveTreasury(property.treasuryId, property.treasuryKey, 'token creation');
  } else if (GLOBAL_TREASURY_ADDRESS) {
    resolved = _resolveTreasury(null, null, 'token creation'); // will use global
  } else {
    // generate a new wallet for the property treasury
    const newWallet = ethers.Wallet.createRandom();
    resolved = { treasuryAddress: newWallet.address, treasuryPrivateKey: newWallet.privateKey };
  }

  const treasuryAddr = resolved.treasuryAddress;
  const treasuryKey = resolved.treasuryPrivateKey; // may be null if fallback global isn't set with key

  // Operator wallet must exist to deploy (pay gas)
  if (!operatorWallet) {
    throw new Error('Operator wallet not configured. Set AVAX_OPERATOR_KEY to deploy contracts.');
  }

  try {
    // Deploy contract with operator as deployer (operator will pay gas)
    const factory = new ethers.ContractFactory(ABI, BYTECODE, operatorWallet);

    // Convert initialSupply to BigInt using decimals (assuming decimals param)
    // For decimals = 0 we use integer amounts. For general case:
    const multiplier = ethers.BigInt(10) ** ethers.BigInt(Number(decimals));
    const initialSupplyBN = ethers.BigInt(String(initialSupply)) * multiplier;

    logger.info(`Deploying ERC-20 token ${name}(${symbol}) supply=${initialSupply} decimals=${decimals} treasury=${treasuryAddr}`);

    // Assumes constructor: (string name, string symbol, uint256 initialSupply, address treasury) — adjust as per your contract
    const contract = await factory.deploy(name, symbol, initialSupplyBN.toString(), treasuryAddr);
    // wait for deployment
    await contract.waitForDeployment ? await contract.waitForDeployment() : await contract.deployed();

    const tokenAddress = contract.target || contract.address; // ethers v6 uses .target; v5 uses .address
    logger.info(`Token deployed at ${tokenAddress}`);

    // Update property record
    const updates = {
      treasuryId: treasuryAddr,
      treasuryKey: treasuryKey || null,
      tokenId: tokenAddress,
      tokenInitialSupply: Number(initialSupply),
      tokenCreatedAt: new Date().toISOString(),
    };

    const updatedProperty = await propertyModel.updateProperty(propertyId, updates);

    return {
      tokenId: tokenAddress,
      totalSupply: Number(initialSupply),
      treasury: treasuryAddr,
      metadata: { propertyId, name, symbol, decimals },
      receipt: { deployed: true },
      property: updatedProperty || { ...property, ...updates },
    };
  } catch (err) {
    logger.error('createToken error:', err);
    throw err;
  }
}

/**
 * Get token info from the deployed ERC-20 contract
 * Returns an object with name, symbol, decimals, totalSupply etc.
 */
async function getTokenInfo(propertyId) {
  if (!propertyId) throw new Error('propertyId is required');

  const property = await propertyModel.getPropertyById(propertyId);
  if (!property) throw new Error(`Property not found: ${propertyId}`);
  if (!property.tokenId) throw new Error(`Property ${propertyId} is not tokenized (missing tokenId)`);

  const provider = _requireProvider();
  const { ABI } = _requireAbiBytecode();

  try {
    const tokenAddr = property.tokenId;
    const contract = new ethers.Contract(tokenAddr, ABI, provider);

    // call common ERC-20 methods (some contracts may differ)
    const name = await contract.name().catch(() => null);
    const symbol = await contract.symbol().catch(() => null);
    const decimals = await contract.decimals().catch(() => null);
    const totalSupplyRaw = await contract.totalSupply().catch(() => null);

    // Normalize totalSupply based on decimals (if decimals available)
    let totalSupply = null;
    if (totalSupplyRaw != null && decimals != null) {
      const parsed = BigInt(totalSupplyRaw.toString());
      const factor = BigInt(10) ** BigInt(Number(decimals));
      totalSupply = Number(parsed / factor); // note: may truncate fractional parts
    } else if (totalSupplyRaw != null) {
      totalSupply = Number(BigInt(totalSupplyRaw.toString()));
    }

    return { name, symbol, decimals: decimals != null ? Number(decimals) : null, totalSupply, raw: { totalSupplyRaw: totalSupplyRaw?.toString?.() } };
  } catch (err) {
    logger.error('getTokenInfo error:', err);
    throw err;
  }
}

/**
 * Mint tokens to the property's treasury (or specified treasury).
 * Requires the deployed contract to expose a `mint(address,uint256)` method and that the signer has permission.
 *
 * @param propertyId
 * @param amount (number|string)
 * @param opts: { treasuryAddress, treasuryPrivateKey }  // treasury used as recipient of minted tokens, but mint call typically done by operator/owner
 */
async function mint(propertyId, amount, opts = {}) {
  if (!propertyId) throw new Error('propertyId is required');
  if (amount == null) throw new Error('amount is required');

  const property = await propertyModel.getPropertyById(propertyId);
  if (!property) throw new Error(`Property not found: ${propertyId}`);
  if (!property.tokenId) throw new Error(`Property ${propertyId} is not tokenized (missing tokenId)`);

  const { treasuryAddress: optAddr, treasuryPrivateKey: optPk } = opts;
  const { treasuryAddress: resolvedAddr } = _resolveTreasury(optAddr || property.treasuryId, optPk || property.treasuryKey, 'minting');

  const { ABI } = _requireAbiBytecode();
  const tokenAddress = property.tokenId;

  // The signer that calls mint must be able to mint — often the operator (deployer) or owner.
  // We'll attempt to use operatorWallet if present; otherwise, try to use treasury key if it has mint role.
  let signer = operatorWallet;
  if (!signer) {
    if (!property.treasuryKey && !optPk) {
      throw new Error('No operator wallet and no treasury private key available to sign mint transaction.');
    }
    const pk = optPk || property.treasuryKey;
    signer = new ethers.Wallet(pk, provider);
  }

  try {
    const contract = new ethers.Contract(tokenAddress, ABI, signer);

    // Read decimals to scale amount if necessary; fallback to 0
    let decimals = 0;
    try {
      const d = await contract.decimals();
      decimals = d != null ? Number(d) : 0;
    } catch (e) {
      decimals = 0;
    }

    const multiplier = ethers.BigInt(10) ** ethers.BigInt(decimals);
    const amountBN = ethers.BigInt(String(amount)) * multiplier;

    // Assumes contract function mint(address to, uint256 amount)
    const tx = await contract.mint(resolvedAddr, amountBN.toString());
    const receipt = await tx.wait();

    logger.info(`Minted ${amount} tokens for property=${propertyId}, token=${tokenAddress}, to=${resolvedAddr}, tx=${receipt.transactionHash}`);

    return { txId: receipt.transactionHash, status: receipt.status === 1 ? 'SUCCESS' : 'FAILED' };
  } catch (err) {
    logger.error('mint error:', err);
    throw err;
  }
}

/**
 * Burn tokens from the treasury (or given account).
 * Assumes contract exposes burn(uint256) or burnFrom(address,uint256) as appropriate.
 *
 * @param propertyId
 * @param amount
 * @param opts { treasuryAddress, treasuryPrivateKey }
 */
async function burn(propertyId, amount, opts = {}) {
  if (!propertyId) throw new Error('propertyId is required');
  if (amount == null) throw new Error('amount is required');

  const property = await propertyModel.getPropertyById(propertyId);
  if (!property) throw new Error(`Property not found: ${propertyId}`);
  if (!property.tokenId) throw new Error(`Property ${propertyId} is not tokenized (missing tokenId)`);

  const { treasuryAddress: optAddr, treasuryPrivateKey: optPk } = opts;
  const { treasuryAddress: resolvedAddr, treasuryPrivateKey: resolvedKey } = _resolveTreasury(optAddr || property.treasuryId, optPk || property.treasuryKey, 'burning');

  const { ABI } = _requireAbiBytecode();
  const tokenAddress = property.tokenId;

  if (!resolvedKey) {
    throw new Error('Treasury private key required to burn tokens from the treasury (signing required). Provide treasuryPrivateKey or set TREASURY_PRIVATE_KEY.');
  }

  const signer = new ethers.Wallet(resolvedKey, provider);

  try {
    const contract = new ethers.Contract(tokenAddress, ABI, signer);

    // Determine decimals
    let decimals = 0;
    try {
      const d = await contract.decimals();
      decimals = d != null ? Number(d) : 0;
    } catch (e) {
      decimals = 0;
    }

    const multiplier = ethers.BigInt(10) ** ethers.BigInt(decimals);
    const amountBN = ethers.BigInt(String(amount)) * multiplier;

    // Prefer burn(uint256) (burns from msg.sender), otherwise try burnFrom(address,uint256)
    let tx;
    if (typeof contract.burn === 'function') {
      tx = await contract.burn(amountBN.toString());
    } else if (typeof contract.burnFrom === 'function') {
      // burnFrom requires approval; assumes treasury signs and burns from itself
      tx = await contract.burnFrom(resolvedAddr, amountBN.toString());
    } else {
      throw new Error('Contract does not expose burn() or burnFrom() function. Update contract or service accordingly.');
    }

    const receipt = await tx.wait();
    logger.info(`Burned ${amount} tokens for property=${propertyId}, token=${tokenAddress}, tx=${receipt.transactionHash}`);

    return { txId: receipt.transactionHash, status: receipt.status === 1 ? 'SUCCESS' : 'FAILED' };
  } catch (err) {
    logger.error('burn error:', err);
    throw err;
  }
}

/**
 * Transfer tokens from property's treasury to another address.
 * @param propertyId
 * @param toAddress
 * @param amount
 * @param opts { treasuryAddress, treasuryPrivateKey, memo }
 */
async function transfer(propertyId, toAddress, amount, opts = {}) {
  if (!propertyId) throw new Error('propertyId is required');
  if (!toAddress) throw new Error('toAddress is required');
  if (amount == null) throw new Error('amount is required');

  const property = await propertyModel.getPropertyById(propertyId);
  if (!property) throw new Error(`Property not found: ${propertyId}`);
  if (!property.tokenId) throw new Error(`Property ${propertyId} is not tokenized (missing tokenId)`);

  const { treasuryAddress: optAddr, treasuryPrivateKey: optPk, memo } = opts;
  const { treasuryAddress: resolvedAddr, treasuryPrivateKey: resolvedKey } = _resolveTreasury(optAddr || property.treasuryId, optPk || property.treasuryKey, 'transfer');

  if (!resolvedKey) {
    throw new Error('Treasury private key required to sign transfer from the treasury. Provide treasuryPrivateKey or set TREASURY_PRIVATE_KEY.');
  }

  const { ABI } = _requireAbiBytecode();
  const tokenAddress = property.tokenId;

  const signer = new ethers.Wallet(resolvedKey, provider);

  try {
    const contract = new ethers.Contract(tokenAddress, ABI, signer);

    // decimals handling
    let decimals = 0;
    try {
      const d = await contract.decimals();
      decimals = d != null ? Number(d) : 0;
    } catch (e) {
      decimals = 0;
    }
    const multiplier = ethers.BigInt(10) ** ethers.BigInt(decimals);
    const amountBN = ethers.BigInt(String(amount)) * multiplier;

    // transfer(to, amount)
    const tx = await contract.transfer(ethers.getAddress(toAddress), amountBN.toString());
    const receipt = await tx.wait();

    logger.info(`Transfer: property=${propertyId}, token=${tokenAddress}, to=${toAddress}, amount=${amount}, tx=${receipt.transactionHash}`);

    return { txId: receipt.transactionHash, status: receipt.status === 1 ? 'SUCCESS' : 'FAILED' };
  } catch (err) {
    logger.error('transfer error:', err);
    throw err;
  }
}

export default {
  createToken,
  getTokenInfo,
  mint,
  burn,
  transfer,
};
