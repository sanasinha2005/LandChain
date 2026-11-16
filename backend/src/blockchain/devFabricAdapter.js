const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const LEDGER_STORAGE_PATH = path.resolve(__dirname, '../../data/dev-fabric-ledger.json');

/**
 * Isolated Development Ledger Adapter matching Hyperledger Fabric state engine
 * Used when the local Docker-based Fabric peer is not running.
 */
class DevFabricAdapter {
  constructor() {
    this.worldState = new Map();
    this.historyStore = new Map(); // landId -> Array of { txId, timestamp, isDelete, record, blockNumber }
    this.transactions = []; // Global list of all committed transactions
    this.blockHeight = 1;
    this.loadLedgerFromDisk();

    if (this.worldState.size === 0) {
      this.seedGenesisLand();
    }
  }

  loadLedgerFromDisk() {
    try {
      if (fs.existsSync(LEDGER_STORAGE_PATH)) {
        const raw = fs.readFileSync(LEDGER_STORAGE_PATH, 'utf8');
        const data = JSON.parse(raw);
        if (data.worldState) {
          for (const [key, val] of Object.entries(data.worldState)) {
            this.worldState.set(key, val);
          }
        }
        if (data.historyStore) {
          for (const [key, val] of Object.entries(data.historyStore)) {
            this.historyStore.set(key, val);
          }
        }
        if (data.transactions) {
          this.transactions = data.transactions;
        }
        if (data.blockHeight) {
          this.blockHeight = data.blockHeight;
        }
        console.log(`📦 Loaded Dev Fabric Ledger: ${this.worldState.size} properties, ${this.transactions.length} transactions, Block Height #${this.blockHeight}`);
      }
    } catch (e) {
      console.warn('⚠️ Could not load dev fabric ledger from disk, starting fresh:', e.message);
    }
  }

  saveLedgerToDisk() {
    try {
      const data = {
        blockHeight: this.blockHeight,
        worldState: Object.fromEntries(this.worldState),
        historyStore: Object.fromEntries(this.historyStore),
        transactions: this.transactions
      };
      const dir = path.dirname(LEDGER_STORAGE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(LEDGER_STORAGE_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('❌ Failed saving dev fabric ledger:', e.message);
    }
  }

  generateFabricTxId() {
    return crypto.randomBytes(32).toString('hex');
  }

  seedGenesisLand() {
    const txId = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const genesisLand = {
      landId: 'LAND-KA-2024-001',
      surveyNumber: 'SY-104/2B',
      currentOwner: {
        name: 'Aarav Sharma',
        email: 'citizen@landchain.gov.in'
      },
      location: 'Whitefield Tech Enclave, Sector 4',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      area: 2400,
      areaUnit: 'Sq Ft',
      landType: 'Residential',
      documentRef: 'REG-DOC-KA-2024-8849',
      status: 'REGISTERED',
      registeredAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z',
      txId: txId,
      blockNumber: 1,
      endorserMsp: 'Org1MSP'
    };

    this.worldState.set(genesisLand.landId, genesisLand);
    this.historyStore.set(genesisLand.landId, [
      {
        txId: txId,
        timestamp: genesisLand.registeredAt,
        isDelete: false,
        record: { ...genesisLand }
      }
    ]);

    this.transactions.push({
      txId: txId,
      function: 'registerLand',
      landId: genesisLand.landId,
      timestamp: genesisLand.registeredAt,
      status: 'VALID',
      blockNumber: 1,
      endorserMsp: 'Org1MSP'
    });

    this.blockHeight = 2;
    this.saveLedgerToDisk();
  }

  async landExists(landId) {
    return this.worldState.has(landId.trim());
  }

  async registerLand(landId, surveyNumber, ownerName, ownerEmail, location, district, state, area, areaUnit, landType, documentRef) {
    const trimmedId = landId.trim();
    if (this.worldState.has(trimmedId)) {
      throw new Error(`Land record with ID "${trimmedId}" already exists on the Hyperledger Fabric ledger.`);
    }

    const txId = this.generateFabricTxId();
    const nowIso = new Date().toISOString();
    const blockNumber = this.blockHeight++;

    const landRecord = {
      landId: trimmedId,
      surveyNumber: surveyNumber.trim(),
      currentOwner: {
        name: ownerName.trim(),
        email: ownerEmail.trim().toLowerCase()
      },
      location: location.trim(),
      district: district.trim(),
      state: state.trim(),
      area: Number(area),
      areaUnit: areaUnit.trim(),
      landType: landType.trim(),
      documentRef: documentRef.trim(),
      status: 'REGISTERED',
      registeredAt: nowIso,
      updatedAt: nowIso,
      txId: txId,
      blockNumber: blockNumber,
      endorserMsp: 'Org1MSP'
    };

    // Commit to World State
    this.worldState.set(trimmedId, landRecord);

    // Commit to Ledger History
    const history = this.historyStore.get(trimmedId) || [];
    history.push({
      txId: txId,
      timestamp: nowIso,
      isDelete: false,
      record: { ...landRecord }
    });
    this.historyStore.set(trimmedId, history);

    // Commit transaction log
    this.transactions.unshift({
      txId: txId,
      function: 'registerLand',
      landId: trimmedId,
      timestamp: nowIso,
      status: 'VALID',
      blockNumber: blockNumber,
      endorserMsp: 'Org1MSP'
    });

    this.saveLedgerToDisk();
    return landRecord;
  }

  async getLand(landId) {
    const trimmedId = landId.trim();
    if (!this.worldState.has(trimmedId)) {
      throw new Error(`Land record "${trimmedId}" does not exist on the Fabric ledger.`);
    }
    return this.worldState.get(trimmedId);
  }

  async transferLand(landId, newOwnerName, newOwnerEmail) {
    const trimmedId = landId.trim();
    if (!this.worldState.has(trimmedId)) {
      throw new Error(`Land record "${trimmedId}" does not exist on the Fabric ledger.`);
    }

    const currentRecord = this.worldState.get(trimmedId);
    const previousOwner = { ...currentRecord.currentOwner };

    const txId = this.generateFabricTxId();
    const nowIso = new Date().toISOString();
    const blockNumber = this.blockHeight++;

    const updatedRecord = {
      ...currentRecord,
      previousOwner: previousOwner,
      currentOwner: {
        name: newOwnerName.trim(),
        email: newOwnerEmail.trim().toLowerCase()
      },
      updatedAt: nowIso,
      txId: txId,
      blockNumber: blockNumber
    };

    this.worldState.set(trimmedId, updatedRecord);

    const history = this.historyStore.get(trimmedId) || [];
    history.push({
      txId: txId,
      timestamp: nowIso,
      isDelete: false,
      record: { ...updatedRecord }
    });
    this.historyStore.set(trimmedId, history);

    this.transactions.unshift({
      txId: txId,
      function: 'transferLand',
      landId: trimmedId,
      timestamp: nowIso,
      status: 'VALID',
      blockNumber: blockNumber,
      endorserMsp: 'Org1MSP'
    });

    this.saveLedgerToDisk();
    return updatedRecord;
  }

  async getLandHistory(landId) {
    const trimmedId = landId.trim();
    if (!this.worldState.has(trimmedId) && !this.historyStore.has(trimmedId)) {
      throw new Error(`Land record "${trimmedId}" does not exist on the Fabric ledger.`);
    }
    return this.historyStore.get(trimmedId) || [];
  }

  async getAllLands() {
    return Array.from(this.worldState.values());
  }

  async getAllTransactions() {
    return this.transactions;
  }

  async getNetworkStatus() {
    return {
      connected: true,
      networkType: 'Hyperledger Fabric (Development Ledger Adapter)',
      isLiveNetwork: false,
      peer: 'peer0.org1.example.com (localhost:7051)',
      channel: 'mychannel',
      chaincode: 'land-contract',
      mspId: 'Org1MSP',
      blockHeight: this.blockHeight,
      totalCommittedLands: this.worldState.size,
      totalTransactions: this.transactions.length
    };
  }
}

module.exports = new DevFabricAdapter();

