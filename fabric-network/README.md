# LandChain - Hyperledger Fabric Test Network

This directory contains the production-grade network deployment configuration and smart contract lifecycle scripts for **LandChain: Blockchain-Based Land Records Management System**.

## Network Topology
- **Orderer Node**: `orderer.example.com:7050` (Raft Consensus)
- **Peer Node**: `peer0.org1.example.com:7051` (Org1MSP Peer with Gossip & TLS)
- **Channel**: `mychannel`
- **Smart Contract (Chaincode)**: `land-contract` (Node.js Contract API v2.5)

## Quick Start (with Docker & Docker Compose installed)

### 1. Launch Fabric Network
```bash
cd fabric-network/scripts
# On Linux/macOS:
chmod +x network.sh
./network.sh up

# On Windows PowerShell:
.\network.ps1 up
```

### 2. Create Channel & Join Peer
```bash
./network.sh createChannel
# Or PowerShell:
.\network.ps1 createChannel
```

### 3. Deploy Chaincode
```bash
./network.sh deployCC
# Or PowerShell:
.\network.ps1 deployCC
```

### 4. Tear Down Network
```bash
./network.sh down
# Or PowerShell:
.\network.ps1 down
```

## Smart Contract Functions Implemented
- `registerLand(ctx, landId, surveyNumber, ownerName, ownerEmail, location, district, state, area, areaUnit, landType, documentRef)`
- `getLand(ctx, landId)`
- `transferLand(ctx, landId, newOwnerName, newOwnerEmail)`
- `getLandHistory(ctx, landId)`
- `landExists(ctx, landId)`
- `getAllLands(ctx)`

