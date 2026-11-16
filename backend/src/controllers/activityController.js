const db = require('../config/db');
const fabricGateway = require('../blockchain/fabricGateway');

/**
 * Get system activity logs
 */
exports.getActivityLogs = async (req, res, next) => {
  try {
    let stmt;
    let logs;

    if (req.user.role === 'registrar') {
      stmt = db.prepare(`
        SELECT 
          l.*,
          u.name as user_name,
          u.email as user_email,
          u.role as user_role
        FROM activity_logs l
        LEFT JOIN users u ON l.user_id = u.id
        ORDER BY l.timestamp DESC
        LIMIT 100
      `);
      logs = stmt.all();
    } else {
      stmt = db.prepare(`
        SELECT 
          l.*,
          u.name as user_name,
          u.email as user_email,
          u.role as user_role
        FROM activity_logs l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE l.user_id = ?
        ORDER BY l.timestamp DESC
        LIMIT 50
      `);
      logs = stmt.all(req.user.id);
    }

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all Hyperledger Fabric blockchain transactions
 */
exports.getBlockchainTransactions = async (req, res, next) => {
  try {
    const transactions = await fabricGateway.getAllTransactions();
    const networkStatus = await fabricGateway.getNetworkStatus();

    res.json({
      success: true,
      count: transactions.length,
      networkStatus: networkStatus,
      data: transactions
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get live Fabric network status
 */
exports.getBlockchainStatus = async (req, res, next) => {
  try {
    const status = await fabricGateway.getNetworkStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (err) {
    next(err);
  }
};

