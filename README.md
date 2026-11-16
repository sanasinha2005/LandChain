# LandChain: Blockchain-Based Land Records Management System

**Secure Land Records. Transparent Ownership. Trusted Transactions.**

LandChain is a state-of-the-art enterprise digital land registry and title conveyance portal powered by **Hyperledger Fabric** smart contracts, **Node.js/Express**, **SQLite**, and **React + Vite + Tailwind CSS**.

The system enables immutable, cryptographically verifiable land title deeds, preventing fraudulent double-selling, tampering with property boundaries, or unauthorized ownership transfers.

---

## 🏛️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    LandChain Web Portal                      │
│                  (React 18 + Vite + Tailwind)                │
└──────────────────────────────┬───────────────────────────────┘
                               │ REST API / JWT
┌──────────────────────────────▼───────────────────────────────┐
│                    Express.js Backend API                    │
│     ├── Authentication & RBAC (Citizen vs Registrar)         │
│     ├── Application Activity Audit Logs                      │
│     └── SQLite Database (Requests, Credentials, Logs)        │
└──────────────────────────────┬───────────────────────────────┘
                               │ Hyperledger Fabric Gateway SDK
┌──────────────────────────────▼───────────────────────────────┐
│               Hyperledger Fabric Enterprise Network          │
│     ├── Channel: mychannel                                   │
│     ├── Chaincode: land-contract (JavaScript Contract API)   │
│     │     ├── registerLand()                                 │
│     │     ├── getLand()                                      │
│     │     ├── transferLand()                                 │
│     │     ├── getLandHistory()                               │
│     │     ├── landExists()                                   │
│     │     └── getAllLands()                                  │
│     └── Raft Consensus & LevelDB World State                 │
└──────────────────────────────────────────────────────────────┘
```

> **Authoritative Ledger Rule**: The blockchain is the sole authoritative source of truth for property ownership and history. SQLite maintains request triage queues, audit logs, and authentication credentials.

---

## 🚀 Technology Stack

- **Frontend**: React.js 18, Vite, Tailwind CSS, Lucide React, React Router 6
- **Backend**: Node.js v24, Express.js, CORS, Morgan, Dotenv
- **Database**: SQLite (`better-sqlite3` with resilient fallback)
- **Blockchain Framework**: Hyperledger Fabric v2.5
- **Smart Contract (Chaincode)**: JavaScript Fabric Contract API (`fabric-contract-api`, `fabric-shim`)
- **Blockchain SDK Integration**: Hyperledger Fabric Gateway SDK (`@hyperledger/fabric-gateway`, `@grpc/grpc-js`)
- **Security & Authentication**: Salted bcrypt hashing + JSON Web Tokens (JWT)
- **Containerization**: Docker Compose (`docker-compose-test-net.yaml`)

---

## 🔑 Pre-Seeded Demonstration Accounts

| Role | Email | Password | Full Name | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Registrar** | `registrar@landchain.gov.in` | `Registrar@123` | Chief Land Registrar | Approve/Reject deeds, endorse Fabric transactions, audit ledger |
| **Citizen (Owner)** | `citizen@landchain.gov.in` | `Citizen@123` | Aarav Sharma | Register land, manage property portfolio, initiate transfers |
| **Citizen (Buyer)** | `buyer@landchain.gov.in` | `Citizen@123` | Priya Patel | Receive transferred titles, verify ownership provenance |

---

## 📦 Project Directory Structure

```
├── backend/
│   ├── src/
│   │   ├── blockchain/
│   │   │   ├── fabricGateway.js       # Official Fabric Gateway SDK client
│   │   │   └── devFabricAdapter.js    # Resilient Fabric state engine
│   │   ├── config/
│   │   │   ├── db.js                  # SQLite database & table initialization
│   │   │   └── fabricConfig.js        # Channel, peer & crypto configuration
│   │   ├── controllers/               # Auth, Land, Transfer, Registrar, Stats, Activity
│   │   ├── middleware/                # JWT verification, Role authorization, Errors
│   │   ├── routes/                    # REST API endpoints
│   │   ├── scripts/
│   │   │   └── seed.js                # Database seeder (Registrar, Citizens, Lands)
│   │   └── server.js                  # Express API server entry point
│   └── package.json
├── chaincode/
│   └── land-contract/
│       ├── lib/
│       │   └── landContract.js        # JavaScript Fabric Chaincode implementation
│       ├── index.js
│       └── package.json
├── fabric-network/
│   ├── docker/
│   │   └── docker-compose-test-net.yaml # Orderer, Peer, CLI containers
│   ├── configtx/
│   │   └── configtx.yaml              # Genesis & channel config
│   ├── organizations/                 # Cryptogen and connection profile
│   └── scripts/
│       ├── network.sh                 # Linux/macOS start/stop script
│       └── network.ps1                # Windows PowerShell start/stop script
├── frontend/
│   ├── src/
│   │   ├── components/                # Navbar, Sidebar, Footer, Badges, Modals
│   │   ├── context/                   # AuthContext, ToastContext
│   │   ├── pages/                     # All 17 application pages
│   │   ├── services/
│   │   │   └── api.js                 # Centralized API fetch client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🛠️ Step-by-Step Installation & Execution

### 1. Install Backend Dependencies & Seed Database
```bash
cd backend
npm install
npm run seed
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Start the Backend API Server
```bash
cd ../backend
npm start
# Server listens on http://localhost:5000
```

### 4. Start the Frontend Development Server
```bash
cd ../frontend
npm run dev
# Vite runs at http://localhost:5173
```

---

## 🐳 Running with the Hyperledger Fabric Test Network

If Docker and Docker Compose are installed on your workstation, you can spin up the full Fabric network and deploy the `land-contract` chaincode:

```bash
cd fabric-network/scripts

# On Linux / macOS:
chmod +x network.sh
./network.sh up
./network.sh createChannel
./network.sh deployCC

# On Windows PowerShell:
.\network.ps1 up
.\network.ps1 createChannel
.\network.ps1 deployCC
```

*Note: If Docker is not installed or running, LandChain transparently activates its isolated Development Fabric Gateway Adapter (`devFabricAdapter.js`), which implements the identical Fabric state machine, SHA-256 transaction IDs, block heights, and historical commit logs without dropping functionality.*

---

## 🧪 Testing Complete Application Workflows

### Workflow 1: Citizen Registration & Login
1. Navigate to `http://localhost:5173/register`.
2. Fill out name, email, contact number, and password.
3. Accept the legal terms and click **Create Citizen Account**.
4. Log into the portal and access the **Citizen Dashboard**.

### Workflow 2: Land Registration & Registrar Approval
1. In the Citizen Dashboard, click **Register New Land**.
2. Fill out Land ID (e.g. `LAND-KA-2024-501`), Survey Number (`SY-104/2B`), Location, District, Area, and Title Deed Reference.
3. Submit the application — it enters SQLite with status `PENDING`.
4. Log out and sign in with the Registrar account: `registrar@landchain.gov.in` / `Registrar@123`.
5. Open **Pending Registrations** (`/registrar/pending-registrations`).
6. Click **Inspect** to examine the cadastre and click **Approve**.
7. The backend executes `registerLand()` on Hyperledger Fabric, commits the record, and returns the 64-character TxID.
8. Search for the Land ID in **Search Land Records** to verify the verified on-chain title.

### Workflow 3: Ownership Transfer & History Tracking
1. Log in as the property owner (`citizen@landchain.gov.in`).
2. Go to **Ownership Transfer** (`/transfer`).
3. Select your property and enter the recipient email: `buyer@landchain.gov.in`.
4. Click **Verify Citizen** to confirm recipient eligibility and submit.
5. Log in as Registrar (`registrar@landchain.gov.in`).
6. Open **Pending Transfers** (`/registrar/pending-transfers`) and click **Approve Transfer**.
7. The backend executes `transferLand()` on Hyperledger Fabric.
8. Open **Ownership History** (`/history?landId=LAND-KA-2024-001`) to inspect the visual provenance timeline.

### Workflow 4: Public Ledger Verification
1. Open the landing page or `/history`.
2. Enter any Land ID (e.g. `LAND-KA-2024-001`).
3. View the instant cryptographic consensus badge, block height, endorsing MSP (`Org1MSP`), and transaction hashes.

---

## 📜 Smart Contract Specification (`landContract.js`)

| Function | Parameters | Description |
| :--- | :--- | :--- |
| `registerLand` | `landId, surveyNumber, ownerName, ownerEmail, location, district, state, area, areaUnit, landType, documentRef` | Creates new title deed on ledger if ID does not exist |
| `getLand` | `landId` | Queries world state for current property details |
| `transferLand` | `landId, newOwnerName, newOwnerEmail` | Updates current owner, logs previous owner, commits new TxID |
| `getLandHistory` | `landId` | Iterates key history for complete provenance trail |
| `landExists` | `landId` | Returns boolean check of key presence |
| `getAllLands` | *(none)* | Returns array of all registered land records |

---

## 🛡️ License

Apache License 2.0. Developed for Land Revenue & National Land Governance Authorities.

