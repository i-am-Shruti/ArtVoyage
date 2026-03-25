const axios = require('axios');
const sha256 = require('sha256');
const uniqid = require('uniqid');
const jwt = require('jsonwebtoken');
const UserInfoPay = require('../models/userInfoPay');
const { asyncHandler } = require('../middleware/errorHandler');
const { validatePaymentData } = require('../middleware/validator');

require('dotenv').config();

const config = {
  merchantId: process.env.MERCHANT_ID || 'PGTESTPAUAT86',
  phonePeUrl: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
  saltIndex: process.env.SALT_INDEX || 1,
  saltKey: process.env.SALT_KEY || 'your-salt-key',
  baseUrl: process.env.BASE_URL || (process.env.NODE_ENV === 'production' 
    ? 'https://ticket-website-one.vercel.app' 
    : 'http://localhost:1338'),
};

const createOrder = asyncHandler(async (req, res) => {
  try {
  const { museumHeader, date, nationality, nationalityPrice, item, itemValue, document, documentNumber, adultNames, childNames, totalPrice } = req.body;

  const validation = validatePaymentData(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({ success: false, message: 'Missing fields: ' + validation.missing.join(', ') });
  }

  if (!totalPrice || totalPrice === '0') {
    return res.status(400).json({ success: false, message: 'Invalid total price' });
  }

  const token = req.cookies.token;
  let userEmail = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userEmail = decoded.email;
    } catch (err) {
      console.log('Invalid token for email');
    }
  }

  const merchantTransactionId = uniqid();

  const paymentDetails = {
    userEmail: userEmail,
    MuseumHeader: museumHeader,
    Date: date,
    SelectedNationality: nationality,
    NationalityPrice: nationalityPrice,
    Item: item || 'Select Items',
    ItemValue: itemValue || '0',
    Document: document,
    DocumentNumber: documentNumber,
    AdultNames: adultNames || '',
    ChildNames: childNames || '',
    totalPrice: totalPrice,
    paymentStatus: 'pending',
    merchantTransactionId: merchantTransactionId
  };

  const booking = await UserInfoPay.create(paymentDetails);

  const payload = {
    merchantId: config.merchantId,
    merchantTransactionId,
    merchantUserId: 'MUID123',
    amount: parseInt(totalPrice) * 100,
    redirectUrl: `${config.baseUrl}/payment/redirect-url/${merchantTransactionId}?bookingId=${booking._id}`,
    redirectMode: 'REDIRECT',
    mobileNumber: '9999999999',
    paymentInstrument: { type: 'PAY_PAGE' },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const xVerify = sha256(base64Payload + '/pg/v1/pay' + config.saltKey) + '###' + config.saltIndex;

  const response = await axios.post(
    `${config.phonePeUrl}/pg/v1/pay`,
    { request: base64Payload },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
      },
    }
  ).catch(err => {
    console.error('PhonePe API error:', err.response?.data || err.message);
    throw err;
  });

  const paymentUrl = response.data?.data?.instrumentResponse?.redirectInfo?.url;

  if (!paymentUrl) {
    throw new Error('Failed to get payment URL from PhonePe');
  }

  res.json({
    success: true,
    paymentUrl,
    bookingId: booking._id,
    merchantTransactionId
  });
  } catch (error) {
    console.error('Payment error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.response?.data?.message || error.message || 'Payment failed' });
  }
});

const handleRedirect = asyncHandler(async (req, res) => {
  const { merchantTransactionId } = req.params;
  const { bookingId } = req.query;
  
  if (!merchantTransactionId || !bookingId) {
    return res.status(400).send('Missing transaction or booking ID');
  }

  const endpoint = `/pg/v1/status/${config.merchantId}/${merchantTransactionId}`;
  const xVerifyChecksum = sha256(endpoint + config.saltKey) + '###' + config.saltIndex;

  const response = await axios.get(`${config.phonePeUrl}${endpoint}`, {
    headers: {
      'X-VERIFY': xVerifyChecksum,
      'X-MERCHANT-ID': merchantTransactionId,
    },
  });

  if (response.data?.code === 'PAYMENT_SUCCESS') {
    const booking = await UserInfoPay.findById(bookingId);
    
    if (booking) {
      booking.paymentStatus = 'success';
      booking.merchantTransactionId = merchantTransactionId;
      await booking.save();

      return res.redirect(`/payment-success?bookingId=${bookingId}`);
    }
  }

  res.redirect('/payment-failed');
});

module.exports = { createOrder, handleRedirect };
