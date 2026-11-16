# LandChain Fabric Network PowerShell Management Script
param(
    [Parameter(Position=0, Mandatory=$true)]
    [ValidateSet("up", "down", "createChannel", "deployCC", "status")]
    [string]$Action
)

$composeFile = Join-Path $PSScriptRoot "..\docker\docker-compose-test-net.yaml"

switch ($Action) {
    "up" {
        Write-Host "Starting LandChain Hyperledger Fabric containers..." -ForegroundColor Cyan
        docker-compose -f $composeFile up -d
        Write-Host "Hyperledger Fabric containers online." -ForegroundColor Green
    }
    "down" {
        Write-Host "Stopping LandChain Hyperledger Fabric containers..." -ForegroundColor Yellow
        docker-compose -f $composeFile down --volumes --remove-orphans
        Write-Host "Fabric network stopped." -ForegroundColor Green
    }
    "createChannel" {
        Write-Host "Creating channel 'mychannel'..." -ForegroundColor Cyan
        docker exec cli peer channel create -o orderer.example.com:7050 -c mychannel -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/mychannel.tx --outputBlock /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/mychannel.block --tls
        docker exec cli peer channel join -b /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/mychannel.block
        Write-Host "Channel active." -ForegroundColor Green
    }
    "deployCC" {
        Write-Host "Packaging and deploying land-contract chaincode..." -ForegroundColor Cyan
        docker exec cli peer lifecycle chaincode package land-contract.tar.gz --path /opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/land-contract --lang node --label land-contract_1.0
        docker exec cli peer lifecycle chaincode install land-contract.tar.gz
        Write-Host "LandChain chaincode deployed to Fabric peer." -ForegroundColor Green
    }
    "status" {
        docker ps --filter "name=example.com"
    }
}

