const express = require('express');
const router = express.Router();
const registrarController = require('../controllers/registrarController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Protect all registrar routes strictly to role: 'registrar'
router.use(verifyToken, requireRole('registrar'));

router.get('/pending-registrations', registrarController.getPendingRegistrations);
router.post('/approve-registration/:id', registrarController.approveRegistration);
router.post('/reject-registration/:id', registrarController.rejectRegistration);

router.get('/pending-transfers', registrarController.getPendingTransfers);
router.post('/approve-transfer/:id', registrarController.approveTransfer);
router.post('/reject-transfer/:id', registrarController.rejectTransfer);

module.exports = router;

