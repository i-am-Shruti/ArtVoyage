const path = require('path');
const sizeOf = require('image-size');
const PDFDocument = require('pdfkit');
const jwt = require('jsonwebtoken');
const UserInfoPay = require('../models/userInfoPay');
const { asyncHandler } = require('../middleware/errorHandler');

require('dotenv').config();

const TICKET_BACKGROUND = path.join(__dirname, '../public/images/ticketBlur.jpg');

const createPDF = (data, res) => {
  const doc = new PDFDocument({ autoFirstPage: false });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=ticket.pdf');

  let pageWidth = 400;
  let pageHeight = 800;

  try {
    const dimensions = sizeOf(TICKET_BACKGROUND);
    pageWidth = dimensions.width;
    pageHeight = dimensions.height;
  } catch (err) {
    console.log('Ticket background not found, using default size');
  }

  doc.addPage({ size: [pageWidth, pageHeight] });

  try {
    doc.image(TICKET_BACKGROUND, 0, 0, { width: pageWidth, height: pageHeight });
  } catch (err) {
    doc.rect(0, 0, pageWidth, pageHeight).fill('#f5f5f5');
  }

  const centerX = pageWidth / 2;
  const textWidth = pageWidth - 80;
  let currentY = Math.floor(pageHeight / 2) - 120;

  const museumName = data.MuseumHeader || data.Museum || '';
  const visitDate = formatDate(data.Date || data.date || '');
  const nationality = data.SelectedNationality || data.Nationality || '';
  const item = (data.Item || '') + ' (Rs ' + (data.ItemValue || data.itemValue || '0') + ')';
  const documentType = data.Document || data.document || '';
  const documentNumber = data.DocumentNumber || data.documentNumber || '';
  const adultNames = data.AdultNames || data.adultNames || 'None';
  const childNames = data.ChildNames || data.childNames || 'None';
  const totalPrice = 'Rs ' + (data.totalPrice || data.TotalPrice || '0');

  const infoText = `
Museum: ${museumName}
Date: ${visitDate}
Nationality: ${nationality}
Item: ${item}
Document: ${documentType}
Document No: ${documentNumber}
Adults: ${adultNames}
Children: ${childNames}
Total Price: ${totalPrice}
  `;

  doc.fontSize(24)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .text(infoText.trim(), 40, currentY, {
      align: 'center',
      width: textWidth,
      lineGap: 10
    });

  doc.pipe(res);
  doc.end();
};

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

const generatePDF = asyncHandler(async (req, res) => {
  const { bookingId } = req.query;
  
  if (!bookingId) {
    return res.status(400).send('Booking ID is required');
  }

  const booking = await UserInfoPay.findById(bookingId);
  
  if (!booking) {
    return res.status(404).send('Booking not found');
  }

  const data = {
    Museum: booking.MuseumHeader,
    Date: booking.Date,
    Nationality: booking.SelectedNationality,
    NationalityPrice: booking.NationalityPrice,
    Item: booking.Item === 'Select Items' ? 'No item taken' : booking.Item,
    ItemValue: booking.ItemValue,
    Document: booking.Document,
    DocumentNumber: booking.DocumentNumber,
    AdultNames: booking.AdultNames?.trim() || 'None',
    ChildNames: booking.ChildNames?.trim() || 'None',
    TotalPrice: booking.totalPrice
  };

  createPDF(data, res);
});

const downloadTicket = asyncHandler(async (req, res) => {
  const { TicketDate, TicketDocumentNum } = req.body;

  const userInfo = await UserInfoPay.findOne({
    Date: TicketDate,
    DocumentNumber: TicketDocumentNum
  });

  if (!userInfo) {
    return res.status(400).json({ success: false, message: 'No ticket details found' });
  }

  createPDF(userInfo, res);
});

const getUserTickets = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  
  let email = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      email = decoded.email;
    } catch (err) {
      // Use userEmail from tickets if available
    }
  }

  const tickets = await UserInfoPay.find({ 
    userEmail: email,
    paymentStatus: 'success'
  }).select('MuseumHeader Date Document DocumentNumber totalPrice').sort({ Date: -1 });

  res.json({ success: true, tickets });
});

const downloadTicketById = asyncHandler(async (req, res) => {
  const { ticketId } = req.body;

  const userInfo = await UserInfoPay.findById(ticketId);

  if (!userInfo) {
    return res.status(400).json({ success: false, message: 'Ticket not found' });
  }

  createPDF(userInfo, res);
});

module.exports = { generatePDF, downloadTicket, getUserTickets, downloadTicketById };
