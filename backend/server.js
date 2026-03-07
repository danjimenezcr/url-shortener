const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB FIRST
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB: ', err));

// Health check (specific route first)
app.use('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// API routes (specific prefix before catch-all)
const urlRoutes = require('./routes/urlRoutes');
app.use('/api', urlRoutes);

// Redirect routes (catch-all LAST)
const redirectRoutes = require('./routes/redirectRoutes');
app.use('/', redirectRoutes);

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));