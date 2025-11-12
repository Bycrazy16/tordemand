// server.js
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const resultsRoute = require('./routes/results');
require('dotenv').config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT;

// JSON middleware
app.use(express.json());

// Enable CORS for frontend React (localhost:3000)
app.use(cors({
  origin: 'http://localhost:3000', // change to frontend domain in production
  methods: ['GET','POST'],
}));

// Helmet Content Security Policy
// 'unsafe-inline' is used here for development to allow React runtime scripts
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"], // allow inline scripts
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"], // allow inline/base64 images
      mediaSrc: ["'self'", "data:"],        // allow inline media
      connectSrc: ["'self'", `http://localhost:${PORT}`], // allow fetch from frontend
    },
  })
);

// API route
app.use('/api/results', resultsRoute);

// Serve React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// First route
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
