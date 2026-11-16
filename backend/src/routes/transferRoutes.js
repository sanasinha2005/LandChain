const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.post('/request', verifyToken, requireRole('citizen'), transferController.submitTransferRequest);
router.get('/my-requests', verifyToken, transferController.getMyTransferRequests);

module.exports = router;

