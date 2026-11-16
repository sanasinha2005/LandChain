const db = require('../config/db');
const fabricGateway = require('../blockchain/fabricGateway');

/**
 * Citizen submits land registration request
 * Step 1-3 of workflow:
 * 1. Citizen submits form
 * 2. Backend validates
 * 3. Request stored in SQLite with PENDING status
 */
exports.submitRegistrationRequest = async (req, res, next) => {
  try {
    const {
      land_id,
      survey_number,
      owner_name,
      location,
      district,
      state,
      area,
      area_unit,
      land_type,
      document_reference
    } = req.body;

    // Field validations
    if (!land_id || !survey_number || !owner_name || !location || !district || !state || !area || !area_unit || !land_type || !document_reference) {
      return res.status(400).json({
        success: false,
        error: 'All fields are mandatory: land_id, survey_number, owner_name, location, district, state, area, area_unit, land_type, document_reference.'
      });
    }

    const cleanLandId = land_id.trim().toUpperCase();

    // Prevent duplicate land IDs: check Fabric ledger
    const existsOnBlockchain = await fabricGateway.landExists(cleanLandId);
    if (existsOnBlockchain) {
      return res.status(400).json({
        success: false,
        error: `Land record "${cleanLandId}" is already registered on the Hyperledger Fabric blockchain.`
      });
    }

    // Check if there is already a pending or approved request in SQLite
    const checkStmt = db.prepare('SELECT id, status FROM registration_requests WHERE land_id = ?');
    const existingReq = checkStmt.get(cleanLandId);
    if (existingReq) {
      return res.status(400).json({
        success: false,
        error: `A registration request for Land ID "${cleanLandId}" already exists with status: ${existingReq.status}.`
      });
    }

    const insertStmt = db.prepare(`
      INSERT INTO registration_requests (
        land_id, user_id, survey_number, location, district, state,
        area, area_unit, land_type, owner_name, document_reference, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
    `);

    const result = insertStmt.run(
      cleanLandId,
      req.user.id,
      survey_number.trim(),
      location.trim(),
      district.trim(),
      state.trim(),
      Number(area),
      area_unit.trim(),
      land_type.trim(),
      owner_name.trim(),
      document_reference.trim()
    );

    // Activity log
    const logStmt = db.prepare('INSERT INTO activity_logs (user_id, action, land_id) VALUES (?, ?, ?)');
    logStmt.run(req.user.id, 'LAND_REGISTRATION_SUBMITTED', cleanLandId);

    res.status(201).json({
      success: true,
      message: 'Land registration request submitted successfully. Awaiting Registrar verification.',
      requestId: result.lastInsertRowid,
      landId: cleanLandId,
      status: 'PENDING'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all registered land records directly from Hyperledger Fabric
 */
exports.getAllLands = async (req, res, next) => {
  try {
    const { search, district, landType, state } = req.query;
    let lands = await fabricGateway.getAllLands();

    // Apply filtering
    if (search) {
      const q = search.trim().toLowerCase();
      lands = lands.filter(l =>
        (l.landId && l.landId.toLowerCase().includes(q)) ||
        (l.surveyNumber && l.surveyNumber.toLowerCase().includes(q)) ||
        (l.currentOwner && l.currentOwner.name && l.currentOwner.name.toLowerCase().includes(q)) ||
        (l.location && l.location.toLowerCase().includes(q))
      );
    }

    if (district) {
      lands = lands.filter(l => l.district && l.district.toLowerCase() === district.trim().toLowerCase());
    }

    if (landType) {
      lands = lands.filter(l => l.landType && l.landType.toLowerCase() === landType.trim().toLowerCase());
    }

    if (state) {
      lands = lands.filter(l => l.state && l.state.toLowerCase() === state.trim().toLowerCase());
    }

    res.json({
      success: true,
      count: lands.length,
      source: 'Hyperledger Fabric Ledger',
      data: lands
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single land record from Fabric ledger by Land ID
 */
exports.getLandDetails = async (req, res, next) => {
  try {
    const landId = req.params.landId.trim().toUpperCase();
    const land = await fabricGateway.getLand(landId);

    // Also get SQLite request metadata if available
    const reqStmt = db.prepare('SELECT * FROM registration_requests WHERE land_id = ?');
    const dbRecord = reqStmt.get(landId);

    res.json({
      success: true,
      source: 'Hyperledger Fabric World State',
      data: land,
      requestMetadata: dbRecord || null
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: `Land record "${req.params.landId}" not found on Hyperledger Fabric ledger.`
    });
  }
};

/**
 * Get ownership history from Fabric ledger
 */
exports.getLandHistory = async (req, res, next) => {
  try {
    const landId = req.params.landId.trim().toUpperCase();
    const history = await fabricGateway.getLandHistory(landId);

    res.json({
      success: true,
      landId: landId,
      source: 'Hyperledger Fabric Ledger History',
      totalCommits: history.length,
      history: history
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: `Unable to retrieve history for "${req.params.landId}": ${err.message}`
    });
  }
};

/**
 * Verify land record existence and cryptographic proof on Hyperledger Fabric
 */
exports.verifyLand = async (req, res, next) => {
  try {
    const landId = req.params.landId.trim().toUpperCase();
    const exists = await fabricGateway.landExists(landId);

    if (!exists) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: `Land ID "${landId}" NOT FOUND on Hyperledger Fabric. This property record is unverified or non-existent.`
      });
    }

    const land = await fabricGateway.getLand(landId);
    const history = await fabricGateway.getLandHistory(landId);

    res.json({
      success: true,
      verified: true,
      source: 'Hyperledger Fabric Peer Consensus',
      data: {
        landId: land.landId,
        surveyNumber: land.surveyNumber,
        currentOwner: land.currentOwner,
        location: `${land.location}, ${land.district}, ${land.state}`,
        area: `${land.area} ${land.areaUnit}`,
        landType: land.landType,
        documentRef: land.documentRef,
        status: land.status,
        registeredAt: land.registeredAt,
        lastUpdatedAt: land.updatedAt,
        latestBlockchainTxId: land.txId,
        blockHeight: land.blockNumber || 1,
        totalHistoricalTransfers: Math.max(0, history.length - 1),
        networkStatus: 'COMMITTED & VERIFIED ON HYPERLEDGER FABRIC LEDGER'
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all properties owned by authenticated citizen (from authoritative blockchain)
 */
exports.getMyProperties = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const allLands = await fabricGateway.getAllLands();

    const myProperties = allLands.filter(
      l => l.currentOwner && l.currentOwner.email && l.currentOwner.email.toLowerCase() === userEmail
    );

    res.json({
      success: true,
      count: myProperties.length,
      data: myProperties
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all registration requests submitted by authenticated citizen
 */
exports.getMyRequests = async (req, res, next) => {
  try {
    const stmt = db.prepare('SELECT * FROM registration_requests WHERE user_id = ? ORDER BY created_at DESC');
    const requests = stmt.all(req.user.id);

    res.json({
      success: true,
      data: requests
    });
  } catch (err) {
    next(err);
  }
};

