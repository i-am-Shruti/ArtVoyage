const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

const requireAuth = (req, res, next) => {
  if (!req.cookies.token) {
    return res.status(401).json({ success: false, message: 'Please login first' });
  }
  next();
};

router.get('/', (req, res) => {
  res.send('PhonePe Integration APIs!');
});

router.post('/create-order', requireAuth, paymentController.createOrder);
router.get('/redirect-url/:merchantTransactionId', paymentController.handleRedirect);

module.exports = router;
