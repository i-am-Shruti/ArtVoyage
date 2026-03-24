const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const requireAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Please log in to download the ticket' });
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
};

router.get('/generatePdf', requireAuth, pdfController.generatePDF);

module.exports = router;
