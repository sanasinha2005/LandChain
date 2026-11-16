const db = require('../config/db');
const fabricGateway = require('../blockchain/fabricGateway');

/**
 * Citizen dashboard metrics & stats
 */
exports.getCitizenStats = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const userId = req.user.id;

    // 1. Authoritative total properties from Hyperledger Fabric
    const allLands = await fabricGateway.getAllLands();
    const myProperties = allLands.filter(
      l => l.currentOwner && l.currentOwner.email && l.currentOwner.email.toLowerCase() === userEmail
    );

    // 2. Pending registrations count from SQLite
    const pendingRegStmt = db.prepare(`
      SELECT COUNT(*) as count FROM registration_requests 
      WHERE user_id = ? AND status = 'PENDING'
    `);
    const pendingRegCount = pendingRegStmt.get(userId)?.count || 0;

    // 3. Pending transfers count from SQLite
    const pendingTransferStmt = db.prepare(`
      SELECT COUNT(*) as count FROM transfer_requests 
      WHERE (current_owner_id = ? OR new_owner_id = ?) AND status = 'PENDING'
    `);
    const pendingTransferCount = pendingTransferStmt.get(userId, userId)?.count || 0;

    // 4. Completed transfers count
    const completedTransferStmt = db.prepare(`
      SELECT COUNT(*) as count FROM transfer_requests 
      WHERE (current_owner_id = ? OR new_owner_id = ?) AND status = 'APPROVED'
    `);
    const completedTransferCount = completedTransferStmt.get(userId, userId)?.count || 0;

    // 5. Recent user activities
    const activityStmt = db.prepare(`
      SELECT * FROM activity_logs 
      WHERE user_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 6
    `);
    const recentActivities = activityStmt.all(userId);

    res.json({
      success: true,
      data: {
        totalProperties: myProperties.length,
        pendingRegistrations: pendingRegCount,
        pendingTransfers: pendingTransferCount,
        completedTransfers: completedTransferCount,
        recentProperties: myProperties.slice(0, 3),
        recentActivities: recentActivities
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Registrar dashboard metrics & stats
 */
exports.getRegistrarStats = async (req, res, next) => {
  try {
    // 1. Total properties registered on Hyperledger Fabric
    const allLands = await fabricGateway.getAllLands();

    // 2. Total registered citizens
    const citizensStmt = db.prepare(`SELECT COUNT(*) as count FROM users WHERE role = 'citizen'`);
    const totalCitizens = citizensStmt.get()?.count || 0;

    // 3. Pending registrations count
    const pendingRegStmt = db.prepare(`SELECT COUNT(*) as count FROM registration_requests WHERE status = 'PENDING'`);
    const pendingRegistrations = pendingRegStmt.get()?.count || 0;

    // 4. Pending transfers count
    const pendingTransferStmt = db.prepare(`SELECT COUNT(*) as count FROM transfer_requests WHERE status = 'PENDING'`);
    const pendingTransfers = pendingTransferStmt.get()?.count || 0;

    // 5. Approved registrations count
    const approvedRegStmt = db.prepare(`SELECT COUNT(*) as count FROM registration_requests WHERE status = 'APPROVED'`);
    const approvedRegistrations = approvedRegStmt.get()?.count || 0;

    // 6. Approved transfers count
    const approvedTransferStmt = db.prepare(`SELECT COUNT(*) as count FROM transfer_requests WHERE status = 'APPROVED'`);
    const approvedTransfers = approvedTransferStmt.get()?.count || 0;

    // 7. Recent blockchain transactions
    const transactions = await fabricGateway.getAllTransactions();

    // 8. Network status
    const networkStatus = await fabricGateway.getNetworkStatus();

    res.json({
      success: true,
      data: {
        totalProperties: allLands.length,
        totalCitizens: totalCitizens,
        pendingRegistrations: pendingRegistrations,
        pendingTransfers: pendingTransfers,
        totalApprovedRegistrations: approvedRegistrations,
        totalApprovedTransfers: approvedTransfers,
        totalTransactions: transactions.length,
        recentTransactions: transactions.slice(0, 5),
        networkStatus: networkStatus
      }
    });
  } catch (err) {
    next(err);
  }
};

