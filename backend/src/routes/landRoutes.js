const express = require('express');
const router = express.Router();
const landController = require('../controllers/landController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Citizen submits land registration request
router.post('/request', verifyToken, requireRole('citizen'), landController.submitRegistrationRequest);

// Citizen gets their registered properties
router.get('/my-properties', verifyToken, landController.getMyProperties);

// Citizen gets their submitted registration requests
router.get('/my-requests', verifyToken, landController.getMyRequests);

// Public land search & query from blockchain
router.get('/', landController.getAllLands);

// Public land verification on blockchain ledger
router.get('/:landId/verify', landController.verifyLand);

// Public ownership history from blockchain ledger
router.get('/:landId/history', landController.getLandHistory);

// Single land details from blockchain ledger
router.get('/:landId', landController.getLandDetails);

module.exports = router;

