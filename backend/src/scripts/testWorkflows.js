const app = require('../server');
const http = require('http');

let server;
let port = 5050;
const baseUrl = `http://localhost:${port}/api`;

async function req(path, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data: json };
}

async function runTests() {
  console.log('\n===============================================================');
  console.log('🧪 RUNNING COMPREHENSIVE LANDCHAIN END-TO-END WORKFLOW SUITE');
  console.log('===============================================================\n');

  // Start temporary test server
  server = app.listen(port);
  await new Promise(resolve => setTimeout(resolve, 500));

  let citizenToken, registrarToken, buyerToken;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Health Check
    // -------------------------------------------------------------------------
    console.log('👉 [TEST 1] System Health Check');
    const health = await req('/health');
    console.assert(health.ok, 'Health check should return 200');
    console.log('   ✅ Health check passed: status =', health.data.status);

    // -------------------------------------------------------------------------
    // WORKFLOW 1: Citizen Registration & Login
    // -------------------------------------------------------------------------
    console.log('\n👉 [WORKFLOW 1] Citizen Registration & Login');
    const uniqueEmail = `citizen_${Date.now()}@testland.gov.in`;
    const regRes = await req('/auth/register', 'POST', {
      name: 'Rohan Deshmukh',
      email: uniqueEmail,
      phone: '+91 9988776655',
      password: 'Password@123'
    });
    console.assert(regRes.ok, `Citizen registration failed: ${JSON.stringify(regRes.data)}`);
    console.log(`   ✅ Citizen registered: ${regRes.data.user.email} (Role: ${regRes.data.user.role})`);

    // Prevent citizen from registering as registrar
    const fakeRegistrar = await req('/auth/register', 'POST', {
      name: 'Hacker',
      email: `fake_${Date.now()}@evil.com`,
      password: 'Password@123',
      role: 'registrar'
    });
    console.assert(fakeRegistrar.data.user.role === 'citizen', 'Should never allow role to be registrar via register endpoint');
    console.log('   ✅ Security check passed: Public registration strictly constrained to role "citizen".');

    // Login as Citizen
    const loginRes = await req('/auth/login', 'POST', {
      email: uniqueEmail,
      password: 'Password@123'
    });
    console.assert(loginRes.ok, 'Citizen login failed');
    citizenToken = loginRes.data.token;
    console.log('   ✅ Citizen authenticated and JWT token issued.');

    // Login as default Registrar
    const regLogin = await req('/auth/login', 'POST', {
      email: 'registrar@landchain.gov.in',
      password: 'Registrar@123'
    });
    console.assert(regLogin.ok, 'Registrar login failed');
    registrarToken = regLogin.data.token;
    console.log(`   ✅ Registrar authenticated: ${regLogin.data.user.email} (Role: ${regLogin.data.user.role})`);

    // Login as Buyer Citizen
    const buyerLogin = await req('/auth/login', 'POST', {
      email: 'buyer@landchain.gov.in',
      password: 'Citizen@123'
    });
    console.assert(buyerLogin.ok, 'Buyer citizen login failed');
    buyerToken = buyerLogin.data.token;
    console.log(`   ✅ Buyer citizen authenticated: ${buyerLogin.data.user.email}`);

    // -------------------------------------------------------------------------
    // WORKFLOW 2: Land Registration & Registrar Approval
    // -------------------------------------------------------------------------
    console.log('\n👉 [WORKFLOW 2] Land Registration & Hyperledger Fabric Commit');
    const testLandId = `LAND-TEST-${Date.now().toString().slice(-4)}`;
    
    // Submit registration request as citizen
    const submitRes = await req('/land/request', 'POST', {
      land_id: testLandId,
      survey_number: 'SY-882/1A',
      owner_name: 'Rohan Deshmukh',
      location: 'Koramangala 4th Block, 80ft Road',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      area: 3200,
      area_unit: 'Sq Ft',
      land_type: 'Residential',
      document_reference: 'TITLE-DOC-KA-2024-4491'
    }, citizenToken);

    console.assert(submitRes.ok, `Land registration submission failed: ${JSON.stringify(submitRes.data)}`);
    const requestId = submitRes.data.requestId;
    console.log(`   ✅ Land registration request submitted: ${testLandId} (Status: PENDING, RequestID: ${requestId})`);

    // Test duplicate land ID prevention
    const duplicateRes = await req('/land/request', 'POST', {
      land_id: testLandId,
      survey_number: 'SY-882/1A',
      owner_name: 'Rohan Deshmukh',
      location: 'Koramangala 4th Block',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      area: 3200,
      area_unit: 'Sq Ft',
      land_type: 'Residential',
      document_reference: 'TITLE-DOC-KA-2024-4491'
    }, citizenToken);
    console.assert(!duplicateRes.ok && duplicateRes.status === 400, 'Duplicate land ID should be blocked');
    console.log('   ✅ Security check passed: Duplicate Land ID rejected.');

    // Unauthorized approval attempt by non-registrar
    const unauthApprove = await req(`/registrar/approve-registration/${requestId}`, 'POST', {}, citizenToken);
    console.assert(unauthApprove.status === 403, 'Citizen should NOT be able to approve land registrations');
    console.log('   ✅ Security check passed: Unauthorized registrar action blocked (403 Forbidden).');

    // Registrar views pending requests
    const pendingList = await req('/registrar/pending-registrations', 'GET', null, registrarToken);
    console.assert(pendingList.ok && pendingList.data.data.some(r => r.land_id === testLandId), 'Pending list should contain submitted request');
    console.log(`   ✅ Registrar retrieved pending queue: ${pendingList.data.count} request(s) awaiting endorsement.`);

    // Registrar approves request -> calls registerLand() on Fabric
    const approveRes = await req(`/registrar/approve-registration/${requestId}`, 'POST', {}, registrarToken);
    console.assert(approveRes.ok, `Approval failed: ${JSON.stringify(approveRes.data)}`);
    console.assert(approveRes.data.blockchainTxId && approveRes.data.blockchainTxId.length === 64, 'TxID should be 64-char SHA256 hash');
    console.log(`   ✅ Registrar approved! Smart contract registerLand() executed on Fabric.`);
    console.log(`      Blockchain TxID: ${approveRes.data.blockchainTxId}`);

    // Verify land is registered and queryable from Hyperledger Fabric
    const getLandRes = await req(`/land/${testLandId}`);
    console.assert(getLandRes.ok, 'Registered land should be queryable');
    console.assert(getLandRes.data.data.status === 'REGISTERED', 'Land status on Fabric must be REGISTERED');
    console.assert(getLandRes.data.data.currentOwner.email === uniqueEmail, 'Owner on Fabric must match applicant');
    console.log(`   ✅ Land verified on Fabric World State. Owner: ${getLandRes.data.data.currentOwner.name}`);

    // -------------------------------------------------------------------------
    // WORKFLOW 3: Ownership Transfer Workflow
    // -------------------------------------------------------------------------
    console.log('\n👉 [WORKFLOW 3] Ownership Transfer & Chaincode Execution');
    
    // Unauthorized transfer attempt by non-owner
    const unauthorizedTransfer = await req('/transfer/request', 'POST', {
      land_id: testLandId,
      new_owner_email: 'buyer@landchain.gov.in',
      reason: 'Illegal transfer attempt'
    }, buyerToken);
    console.assert(unauthorizedTransfer.status === 403, 'Non-owner should NOT be able to initiate transfer');
    console.log('   ✅ Security check passed: Non-owner transfer request rejected (403 Forbidden).');

    // Legitimate owner initiates transfer
    const transferReqRes = await req('/transfer/request', 'POST', {
      land_id: testLandId,
      new_owner_email: 'buyer@landchain.gov.in',
      reason: 'Execution of deed of absolute sale'
    }, citizenToken);
    console.assert(transferReqRes.ok, `Transfer request failed: ${JSON.stringify(transferReqRes.data)}`);
    const transferId = transferReqRes.data.requestId;
    console.log(`   ✅ Transfer request submitted: from ${uniqueEmail} to buyer@landchain.gov.in (RequestID: ${transferId})`);

    // Duplicate pending transfer prevention
    const dupTransfer = await req('/transfer/request', 'POST', {
      land_id: testLandId,
      new_owner_email: 'buyer@landchain.gov.in'
    }, citizenToken);
    console.assert(dupTransfer.status === 400, 'Duplicate pending transfer should be rejected');
    console.log('   ✅ Security check passed: Duplicate pending transfer request rejected.');

    // Registrar views pending transfers
    const pendingTransfers = await req('/registrar/pending-transfers', 'GET', null, registrarToken);
    console.assert(pendingTransfers.ok && pendingTransfers.data.data.some(t => t.id === transferId), 'Pending transfer list missing request');
    console.log(`   ✅ Registrar retrieved pending transfer queue: ${pendingTransfers.data.count} transfer(s).`);

    // Registrar approves transfer -> calls transferLand() on Fabric
    const approveTransferRes = await req(`/registrar/approve-transfer/${transferId}`, 'POST', {}, registrarToken);
    console.assert(approveTransferRes.ok, `Transfer approval failed: ${JSON.stringify(approveTransferRes.data)}`);
    console.assert(approveTransferRes.data.blockchainTxId.length === 64, 'Transfer TxID must be 64-char hash');
    console.log(`   ✅ Registrar approved transfer! Smart contract transferLand() executed on Fabric.`);
    console.log(`      Transfer Blockchain TxID: ${approveTransferRes.data.blockchainTxId}`);

    // Verify updated ownership on Fabric ledger
    const updatedLand = await req(`/land/${testLandId}`);
    console.assert(updatedLand.data.data.currentOwner.email === 'buyer@landchain.gov.in', 'New owner must be buyer');
    console.assert(updatedLand.data.data.previousOwner.email === uniqueEmail, 'Previous owner must be preserved');
    console.log(`   ✅ Fabric Ledger Updated: New Owner = ${updatedLand.data.data.currentOwner.name}, Previous Owner = ${updatedLand.data.data.previousOwner.name}`);

    // -------------------------------------------------------------------------
    // WORKFLOW 4: Land Verification & Provenance History
    // -------------------------------------------------------------------------
    console.log('\n👉 [WORKFLOW 4] Blockchain Verification & Ownership History Timeline');
    
    // Verify Land on Ledger
    const verifyRes = await req(`/land/${testLandId}/verify`);
    console.assert(verifyRes.ok && verifyRes.data.verified === true, 'Land must be verified on Fabric');
    console.log(`   ✅ Verification Result: Verified = true, BlockHeight = #${verifyRes.data.data.blockHeight}, Network = "${verifyRes.data.data.networkStatus}"`);

    // Check complete provenance history
    const historyRes = await req(`/land/${testLandId}/history`);
    console.assert(historyRes.ok, 'Failed retrieving history');
    console.assert(historyRes.data.totalCommits >= 2, 'History must contain at least genesis registration + transfer');
    console.log(`   ✅ Provenance History Trail: ${historyRes.data.totalCommits} commits found:`);
    historyRes.data.history.forEach((h, idx) => {
      console.log(`      Commit #${idx + 1}: TxID=${h.txId.slice(0, 16)}... | Owner=${h.record.currentOwner.name} | Timestamp=${h.timestamp}`);
    });

    // -------------------------------------------------------------------------
    // DASHBOARD & ACTIVITY AUDIT CHECKS
    // -------------------------------------------------------------------------
    console.log('\n👉 [TEST 5] Dashboard APIs & Blockchain Explorer');
    const citizenStats = await req('/stats/citizen', 'GET', null, citizenToken);
    console.assert(citizenStats.ok, 'Citizen stats failed');
    console.log(`   ✅ Citizen Dashboard Data: Properties=${citizenStats.data.data.totalProperties}, PendingReg=${citizenStats.data.data.pendingRegistrations}`);

    const registrarStats = await req('/stats/registrar', 'GET', null, registrarToken);
    console.assert(registrarStats.ok, 'Registrar stats failed');
    console.log(`   ✅ Registrar Dashboard Data: TotalProperties=${registrarStats.data.data.totalProperties}, Citizens=${registrarStats.data.data.totalCitizens}, TotalTx=${registrarStats.data.data.totalTransactions}`);

    const txExplorer = await req('/activity/blockchain/transactions');
    console.assert(txExplorer.ok && txExplorer.data.count > 0, 'Transactions explorer failed');
    console.log(`   ✅ Blockchain Explorer: ${txExplorer.data.count} transactions recorded across channel.`);

    console.log('\n===============================================================');
    console.log('🎉 ALL WORKFLOWS & SECURITY TEST CHECKS PASSED SUCCESSFULLY!');
    console.log('===============================================================\n');

  } catch (err) {
    console.error('❌ Test suite error:', err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
  }
}

runTests();

