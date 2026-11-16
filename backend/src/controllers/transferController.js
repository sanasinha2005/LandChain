const db = require('../config/db');
const fabricGateway = require('../blockchain/fabricGateway');

/**
 * Citizen initiates ownership transfer request
 */
exports.submitTransferRequest = async (req, res, next) => {
  try {
    const { land_id, new_owner_email, reason } = req.body;

    if (!land_id || !new_owner_email) {
      return res.status(400).json({
        success: false,
        error: 'Land ID and new owner email are required.'
      });
    }

    const cleanLandId = land_id.trim().toUpperCase();
    const cleanNewOwnerEmail = new_owner_email.trim().toLowerCase();

    // 1. Verify land exists on Hyperledger Fabric
    const exists = await fabricGateway.landExists(cleanLandId);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: `Land record "${cleanLandId}" does not exist on the Hyperledger Fabric ledger.`
      });
    }

    // 2. Verify current user is actually the registered owner on the blockchain
    const land = await fabricGateway.getLand(cleanLandId);
    if (!land.currentOwner || land.currentOwner.email.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: `Unauthorized: You are not the registered owner of Land ID "${cleanLandId}" on the blockchain. Current owner is: ${land.currentOwner ? land.currentOwner.name : 'Unknown'}.`
      });
    }

    // 3. Verify new owner is not the current owner
    if (cleanNewOwnerEmail === req.user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot transfer property ownership to yourself.'
      });
    }

    // 4. Verify new owner is a registered citizen in SQLite
    const userStmt = db.prepare('SELECT id, name, email, role FROM users WHERE email = ?');
    const newOwner = userStmt.get(cleanNewOwnerEmail);
    if (!newOwner) {
      return res.status(404).json({
        success: false,
        error: `Citizen with email "${cleanNewOwnerEmail}" is not registered on LandChain. The recipient must register first.`
      });
    }

    // 5. Check for existing pending transfer for this land
    const pendingStmt = db.prepare("SELECT id FROM transfer_requests WHERE land_id = ? AND status = 'PENDING'");
    const existingPending = pendingStmt.get(cleanLandId);
    if (existingPending) {
      return res.status(400).json({
        success: false,
        error: `A pending ownership transfer request already exists for Land ID "${cleanLandId}".`
      });
    }

    // 6. Insert into transfer_requests table in SQLite
    const insertStmt = db.prepare(`
      INSERT INTO transfer_requests (
        land_id, current_owner_id, new_owner_id, status
      ) VALUES (?, ?, ?, 'PENDING')
    `);

    const result = insertStmt.run(cleanLandId, req.user.id, newOwner.id);

    // Activity log
    const logStmt = db.prepare('INSERT INTO activity_logs (user_id, action, land_id) VALUES (?, ?, ?)');
    logStmt.run(req.user.id, 'TRANSFER_REQUEST_SUBMITTED', cleanLandId);

    res.status(201).json({
      success: true,
      message: `Ownership transfer request for ${cleanLandId} submitted to Registrar for legal verification.`,
      requestId: result.lastInsertRowid,
      landId: cleanLandId,
      newOwner: {
        id: newOwner.id,
        name: newOwner.name,
        email: newOwner.email
      },
      status: 'PENDING'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get transfer requests related to authenticated citizen (as sender or recipient)
 */
exports.getMyTransferRequests = async (req, res, next) => {
  try {
    const stmt = db.prepare(`
      SELECT
        t.*,
        sender.name as sender_name,
        sender.email as sender_email,
        receiver.name as receiver_name,
        receiver.email as receiver_email
      FROM transfer_requests t
      LEFT JOIN users sender ON t.current_owner_id = sender.id
      LEFT JOIN users receiver ON t.new_owner_id = receiver.id
      WHERE t.current_owner_id = ? OR t.new_owner_id = ?
      ORDER BY t.created_at DESC
    `);

    const requests = stmt.all(req.user.id, req.user.id);

    res.json({
      success: true,
      data: requests
    });
  } catch (err) {
    next(err);
  }
};

