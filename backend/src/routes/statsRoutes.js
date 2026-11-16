const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/citizen', verifyToken, statsController.getCitizenStats);
router.get('/registrar', verifyToken, requireRole('registrar'), statsController.getRegistrarStats);

module.exports = router;

