const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const pdfRoutes = require('./routes/pdfRoutes');

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
const publicPath = path.join(__dirname, 'public');
app.use('/css', express.static(path.join(publicPath, 'css')));
app.use('/js', express.static(path.join(publicPath, 'js')));
app.use('/image', express.static(path.join(publicPath, 'images')));

// API Routes
app.use('/auth', authRoutes);
app.use('/payment', paymentRoutes);
app.use('/pdf', pdfRoutes);

// Route protection middleware
const requireLogin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(401).json({ success: false, message: 'Please login first' });
    }
    return res.redirect('/');
  }
  next();
};

const requireSelection = (req, res, next) => {
  const selectedMuseum = req.headers['x-selected-museum'] || req.query.museum;
  if (!selectedMuseum) {
    return res.redirect('/selection');
  }
  next();
};

// Public pages (accessible to all)
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'html', 'home.html'));
});

app.get('/login', (req, res) => {
  if (req.cookies.token) {
    return res.redirect('/selection');
  }
  res.sendFile(path.join(publicPath, 'html', 'login.html'));
});

// Protected pages - require login
const protectedPages = ['/selection'];

protectedPages.forEach(route => {
  app.get(route, (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(401).json({ success: false, message: 'Please login first' });
      }
      return res.redirect('/login');
    }
    res.sendFile(path.join(publicPath, 'html', 'selection.html'));
  });
});

// Protected pages - require museum selection
const museumPages = [
  { route: '/NetajiMuseum', file: 'NetajiMuseum.html' },
  { route: '/stateMuseum', file: 'stateMuseum.html' },
  { route: '/kalaBhoomi', file: 'kalaBhoomi.html' },
  { route: '/MaritimeMuseum', file: 'MaritimeMuseum.html' },
  { route: '/tribalMuseum', file: 'tribalMuseum.html' },
];

museumPages.forEach(({ route, file }) => {
  app.get(route, (req, res) => {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect('/login');
    }
    const expectedMuseum = file.replace('.html', '');
    const currentMuseum = req.query.museum;
    if (currentMuseum !== expectedMuseum && !req.query.skipCheck) {
      return res.redirect('/selection');
    }
    res.sendFile(path.join(publicPath, 'html', file));
  });
});

// Payment result pages
app.get('/payment-success', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(publicPath, 'html', 'paymentSuccess.html'));
});

app.get('/payment-failed', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(publicPath, 'html', 'paymentFailed.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
