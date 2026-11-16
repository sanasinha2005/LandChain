const path = require('path');

module.exports = {
  channelName: process.env.FABRIC_CHANNEL || 'mychannel',
  chaincodeName: process.env.FABRIC_CHAINCODE || 'land-contract',
  mspId: process.env.FABRIC_MSP_ID || 'Org1MSP',
  cryptoPath: path.resolve(__dirname, '../../../fabric-network/organizations/peerOrganizations/org1.example.com'),
  peerEndpoint: process.env.FABRIC_PEER_ENDPOINT || 'localhost:7051',
  peerHostAlias: process.env.FABRIC_PEER_HOST_ALIAS || 'peer0.org1.example.com',
  connectionProfilePath: path.resolve(__dirname, '../../../fabric-network/organizations/peerOrganizations/org1.example.com/connection-org1.json')
};

