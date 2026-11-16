const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/logs', verifyToken, activityController.getActivityLogs);
router.get('/blockchain/transactions', activityController.getBlockchainTransactions);
router.get('/blockchain/status', activityController.getBlockchainStatus);

module.exports = router;

