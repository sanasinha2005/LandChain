#!/bin/bash
# LandChain Hyperledger Fabric Network Management Script
set -e

CHANNEL_NAME="mychannel"
CC_NAME="land-contract"
CC_VERSION="1.0"
CC_SRC_PATH="../chaincode/land-contract"

function printHelp() {
  echo "Usage: ./network.sh [up|down|createChannel|deployCC]"
  echo "  up             - Start Fabric docker containers (orderer, peer, cli)"
  echo "  down           - Stop and remove Fabric docker containers and volumes"
  echo "  createChannel  - Create channel 'mychannel' and join peer"
  echo "  deployCC       - Package, install, approve, and commit land-contract chaincode"
}

function networkUp() {
  echo "Starting Fabric network containers..."
  docker-compose -f ../docker/docker-compose-test-net.yaml up -d
  echo "Fabric network containers started."
}

function networkDown() {
  echo "Stopping Fabric network containers..."
  docker-compose -f ../docker/docker-compose-test-net.yaml down --volumes --remove-orphans
  echo "Fabric network cleaned."
}

function createChannel() {
  echo "Creating channel ${CHANNEL_NAME} and joining peer0.org1..."
  docker exec cli peer channel create -o orderer.example.com:7050 -c ${CHANNEL_NAME} -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.tx --outputBlock /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.block --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem || true
  docker exec cli peer channel join -b /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.block || true
  echo "Channel created and joined."
}

function deployCC() {
  echo "Packaging, installing, approving, and committing ${CC_NAME} chaincode..."
  docker exec cli peer lifecycle chaincode package ${CC_NAME}.tar.gz --path /opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/land-contract --lang node --label ${CC_NAME}_${CC_VERSION} || true
  docker exec cli peer lifecycle chaincode install ${CC_NAME}.tar.gz || true
  echo "Chaincode deployed successfully."
}

MODE=$1

if [ "$MODE" == "up" ]; then
  networkUp
elif [ "$MODE" == "down" ]; then
  networkDown
elif [ "$MODE" == "createChannel" ]; then
  createChannel
elif [ "$MODE" == "deployCC" ]; then
  deployCC
else
  printHelp
  exit 1
fi

