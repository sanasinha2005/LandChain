const db = require('../config/db');
const fabricGateway = require('../blockchain/fabricGateway');

/**
 * Get all pending land registration requests for Registrar review
 */
exports.getPendingRegistrations = async (req, res, next) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        r.*,
        u.name as citizen_name,
        u.email as citizen_email,
        u.phone as citizen_phone
      FROM registration_requests r
      JOIN users u ON r.user_id = u.id
      WHERE r.status = 'PENDING'
      ORDER BY r.created_at ASC
    `);

    const pendingList = stmt.all();

    res.json({
      success: true,
      count: pendingList.length,
      data: pendingList
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Registrar approves land registration:
 * Calls registerLand() on Hyperledger Fabric, commits to blockchain,
 * stores the Fabric TxID in SQLite and marks request as APPROVED.
 */
exports.approveRegistration = async (req, res, next) => {
  try {
    const requestId = req.params.id;

    const stmt = db.prepare(`
      SELECT r.*, u.email as user_email 
      FROM registration_requests r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `);
    const request = stmt.get(requestId);

    if (!request) {
      return res.status(404).json({ success: false, error: 'Registration request not found.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Cannot approve request with current status: ${request.status}.`
      });
    }

    console.log(`[Registrar] Approving registration for ${request.land_id} and invoking Hyperledger Fabric...`);

    // Execute Smart Contract on Hyperledger Fabric
    const committedLand = await fabricGateway.registerLand(
      request.land_id,
      request.survey_number,
      request.owner_name,
      request.user_email,
      request.location,
      request.district,
      request.state,
      request.area,
      request.area_unit,
      request.land_type,
      request.document_reference
    );

    const txId = committedLand.txId;

    // Update SQLite request with APPROVED status and Fabric TxID
    const updateStmt = db.prepare(`
      UPDATE registration_requests
      SET status = 'APPROVED',
          registrar_id = ?,
          blockchain_tx_id = ?
      WHERE id = ?
    `);
    updateStmt.run(req.user.id, txId, requestId);

    // Audit log
    const logStmt = db.prepare('INSERT INTO activity_logs (user_id, action, land_id) VALUES (?, ?, ?)');
    logStmt.run(req.user.id, 'REGISTRATION_APPROVED_BY_REGISTRAR', request.land_id);

    res.json({
      success: true,
      message: `Land ${request.land_id} successfully approved and committed to Hyperledger Fabric.`,
      landId: request.land_id,
      blockchainTxId: txId,
      status: 'APPROVED',
      committedData: committedLand
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Registrar rejects land registration request
 */
exports.rejectRegistration = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const { reason } = req.body;

    const stmt = db.prepare('SELECT * FROM registration_requests WHERE id = ?');
    const request = stmt.get(requestId);

    if (!request) {
      return res.status(404).json({ success: false, error: 'Registration request not found.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Cannot reject request with status: ${request.status}.`
      });
    }

    const updateStmt = db.prepare(`
      UPDATE registration_requests
      SET status = 'REJECTED',
          registrar_id = ?
      WHERE id = ?
    `);
    updateStmt.run(req.user.id, requestId);

    // Audit log
    const logStmt = db.prepare('INSERT INTO activity_logs (user_id, action, land_id) VALUES (?, ?, ?)');
    logStmt.run(req.user.id, 'REGISTRATION_REJECTED_BY_REGISTRAR', request.land_id);

    res.json({
      success: true,
      message: `Land registration request for ${request.land_id} has been rejected.`,
      landId: request.land_id,
      status: 'REJECTED',
      reason: reason || 'Documentation verification failed.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all pending ownership transfer requests for Registrar review
 */
exports.getPendingTransfers = async (req, res, next) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        t.*,
        sender.name as current_owner_name,
        sender.email as current_owner_email,
        sender.phone as current_owner_phone,
        receiver.name as new_owner_name,
        receiver.email as new_owner_email,
        receiver.phone as new_owner_phone
      FROM transfer_requests t
      JOIN users sender ON t.current_owner_id = sender.id
      JOIN users receiver ON t.new_owner_id = receiver.id
      WHERE t.status = 'PENDING'
      ORDER BY t.created_at ASC
    `);

    const pendingList = stmt.all();

    res.json({
      success: true,
      count: pendingList.length,
      data: pendingList
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Registrar approves ownership transfer:
 * Calls transferLand() on Hyperledger Fabric, commits to blockchain,
 * stores the Fabric TxID in SQLite and marks request as APPROVED.
 */
exports.approveTransfer = async (req, res, next) => {
  try {
    const requestId = req.params.id;

    const stmt = db.prepare(`
      SELECT 
        t.*,
        receiver.name as new_owner_name,
        receiver.email as new_owner_email
      FROM transfer_requests t
      JOIN users receiver ON t.new_owner_id = receiver.id
      WHERE t.id = ?
    `);
    const request = stmt.get(requestId);

    if (!request) {
      return res.status(404).json({ success: false, error: 'Transfer request not found.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Cannot approve transfer with status: ${request.status}.`
      });
    }

    console.log(`[Registrar] Approving ownership transfer for ${request.land_id} to ${request.new_owner_email}...`);

    // Execute transfer on Hyperledger Fabric Smart Contract
    const updatedLand = await fabricGateway.transferLand(
      request.land_id,
      request.new_owner_name,
      request.new_owner_email
    );

    const txId = updatedLand.txId;

    // Update SQLite request with APPROVED status and Fabric TxID
    const updateStmt = db.prepare(`
      UPDATE transfer_requests
      SET status = 'APPROVED',
          registrar_id = ?,
          blockchain_tx_id = ?
      WHERE id = ?
    `);
    updateStmt.run(req.user.id, txId, requestId);

    // Audit log
    const logStmt = db.prepare('INSERT INTO activity_logs (user_id, action, land_id) VALUES (?, ?, ?)');
    logStmt.run(req.user.id, 'TRANSFER_APPROVED_BY_REGISTRAR', request.land_id);

    res.json({
      success: true,
      message: `Ownership transfer for ${request.land_id} committed to Hyperledger Fabric successfully.`,
      landId: request.land_id,
      blockchainTxId: txId,
      status: 'APPROVED',
      updatedData: updatedLand
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Registrar rejects ownership transfer request
 */
exports.rejectTransfer = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const { reason } = req.body;

    const stmt = db.prepare('SELECT * FROM transfer_requests WHERE id = ?');
    const request = stmt.get(requestId);

    if (!request) {
      return res.status(404).json({ success: false, error: 'Transfer request not found.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Cannot reject transfer with status: ${request.status}.`
      });
    }

    const updateStmt = db.prepare(`
      UPDATE transfer_requests
      SET status = 'REJECTED',
          registrar_id = ?
      WHERE id = ?
    `);
    updateStmt.run(req.user.id, requestId);

    // Audit log
    const logStmt = db.prepare('INSERT INTO activity_logs (user_id, action, land_id) VALUES (?, ?, ?)');
    logStmt.run(req.user.id, 'TRANSFER_REJECTED_BY_REGISTRAR', request.land_id);

    res.json({
      success: true,
      message: `Ownership transfer for ${request.land_id} has been rejected.`,
      landId: request.land_id,
      status: 'REJECTED',
      reason: reason || 'Legal verification criteria not met.'
    });
  } catch (err) {
    next(err);
  }
};

