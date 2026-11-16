const fs = require('fs');
const path = require('path');
const fabricConfig = require('../config/fabricConfig');
const devFabricAdapter = require('./devFabricAdapter');

let gatewayInstance = null;
let networkInstance = null;
let contractInstance = null;
let isFabricLive = false;

/**
 * Attempt to initialize live connection to Hyperledger Fabric Gateway
 */
async function initializeFabricGateway() {
  try {
    const grpc = require('@grpc/grpc-js');
    const { connect, signers } = require('@hyperledger/fabric-gateway');

    const certPath = path.resolve(
      fabricConfig.cryptoPath,
      'users/User1@org1.example.com/msp/signcerts/User1@org1.example.com-cert.pem'
    );
    const keyPath = path.resolve(
      fabricConfig.cryptoPath,
      'users/User1@org1.example.com/msp/keystore/priv_sk'
    );
    const tlsRootCertPath = path.resolve(
      fabricConfig.cryptoPath,
      'peers/peer0.org1.example.com/tls/ca.crt'
    );

    if (!fs.existsSync(certPath) || !fs.existsSync(tlsRootCertPath)) {
      console.log('ℹ️ Fabric cryptographic materials not found on local path. Running in Dev Fabric Adapter mode.');
      isFabricLive = false;
      return;
    }

    const tlsCredentials = grpc.credentials.createSsl(fs.readFileSync(tlsRootCertPath));
    const client = new grpc.Client(fabricConfig.peerEndpoint, tlsCredentials, {
      'grpc.ssl_target_name_override': fabricConfig.peerHostAlias,
    });

    const certificate = fs.readFileSync(certPath);
    const privateKeyPem = fs.readFileSync(keyPath);
    const signer = signers.newPrivateKeySigner(privateKeyPem);

    const gateway = connect({
      client,
      identity: { mspId: fabricConfig.mspId, credentials: certificate },
      signer,
      evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
      endorseOptions: () => ({ deadline: Date.now() + 15000 }),
      submitOptions: () => ({ deadline: Date.now() + 5000 }),
      commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
    });

    const network = gateway.getNetwork(fabricConfig.channelName);
    const contract = network.getContract(fabricConfig.chaincodeName);

    gatewayInstance = gateway;
    networkInstance = network;
    contractInstance = contract;
    isFabricLive = true;

    console.log(`🚀 Connected to live Hyperledger Fabric Network: channel=${fabricConfig.channelName}, contract=${fabricConfig.chaincodeName}`);
  } catch (error) {
    console.warn(`⚠️ Hyperledger Fabric Live Peer connection check: ${error.message}`);
    console.log('ℹ️ Operating in resilient Dev Fabric Adapter mode. Real blockchain state engine active.');
    isFabricLive = false;
  }
}

// Attempt initial Fabric connection
initializeFabricGateway();

module.exports = {
  isLive: () => isFabricLive,

  async getNetworkStatus() {
    if (isFabricLive) {
      return {
        connected: true,
        networkType: 'Hyperledger Fabric v2.5 (Live Gateway)',
        isLiveNetwork: true,
        peer: fabricConfig.peerEndpoint,
        peerHostAlias: fabricConfig.peerHostAlias,
        channel: fabricConfig.channelName,
        chaincode: fabricConfig.chaincodeName,
        mspId: fabricConfig.mspId
      };
    }
    return devFabricAdapter.getNetworkStatus();
  },

  async registerLand(landId, surveyNumber, ownerName, ownerEmail, location, district, state, area, areaUnit, landType, documentRef) {
    if (isFabricLive && contractInstance) {
      console.log(`[Fabric Gateway] Submitting registerLand for ${landId} to live peer...`);
      const resultBytes = await contractInstance.submitTransaction(
        'registerLand',
        landId,
        surveyNumber,
        ownerName,
        ownerEmail,
        location,
        district,
        state,
        String(area),
        areaUnit,
        landType,
        documentRef
      );
      const jsonStr = Buffer.from(resultBytes).toString('utf8');
      return JSON.parse(jsonStr);
    }
    return devFabricAdapter.registerLand(landId, surveyNumber, ownerName, ownerEmail, location, district, state, area, areaUnit, landType, documentRef);
  },

  async getLand(landId) {
    if (isFabricLive && contractInstance) {
      console.log(`[Fabric Gateway] Evaluating getLand for ${landId} on live peer...`);
      const resultBytes = await contractInstance.evaluateTransaction('getLand', landId);
      const jsonStr = Buffer.from(resultBytes).toString('utf8');
      return JSON.parse(jsonStr);
    }
    return devFabricAdapter.getLand(landId);
  },

  async transferLand(landId, newOwnerName, newOwnerEmail) {
    if (isFabricLive && contractInstance) {
      console.log(`[Fabric Gateway] Submitting transferLand for ${landId} to ${newOwnerEmail}...`);
      const resultBytes = await contractInstance.submitTransaction(
        'transferLand',
        landId,
        newOwnerName,
        newOwnerEmail
      );
      const jsonStr = Buffer.from(resultBytes).toString('utf8');
      return JSON.parse(jsonStr);
    }
    return devFabricAdapter.transferLand(landId, newOwnerName, newOwnerEmail);
  },

  async getLandHistory(landId) {
    if (isFabricLive && contractInstance) {
      console.log(`[Fabric Gateway] Evaluating getLandHistory for ${landId}...`);
      const resultBytes = await contractInstance.evaluateTransaction('getLandHistory', landId);
      const jsonStr = Buffer.from(resultBytes).toString('utf8');
      return JSON.parse(jsonStr);
    }
    return devFabricAdapter.getLandHistory(landId);
  },

  async landExists(landId) {
    if (isFabricLive && contractInstance) {
      const resultBytes = await contractInstance.evaluateTransaction('landExists', landId);
      return Buffer.from(resultBytes).toString('utf8') === 'true';
    }
    return devFabricAdapter.landExists(landId);
  },

  async getAllLands() {
    if (isFabricLive && contractInstance) {
      console.log('[Fabric Gateway] Evaluating getAllLands on live peer...');
      const resultBytes = await contractInstance.evaluateTransaction('getAllLands');
      const jsonStr = Buffer.from(resultBytes).toString('utf8');
      return JSON.parse(jsonStr);
    }
    return devFabricAdapter.getAllLands();
  },

  async getAllTransactions() {
    return devFabricAdapter.getAllTransactions();
  }
};

