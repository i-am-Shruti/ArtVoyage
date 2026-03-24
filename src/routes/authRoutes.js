const express = require('express');
const router = express.Router();
const path = require('path');
const authController = require('../controllers/authController');
const pdfController = require('../controllers/pdfController');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/login.html'));
});

router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/set-password', authController.setPassword);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/logout', authController.logout);
router.get('/check-session', authController.checkSession);

router.post('/ticket', pdfController.downloadTicket);
router.post('/user-tickets', pdfController.getUserTickets);
router.post('/download-ticket', pdfController.downloadTicketById);

module.exports = router;
