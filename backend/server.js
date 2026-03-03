const express = require('express'); // Web framework for Node.js
const mongoose = require('mongoose'); // MongoDB object modeling tool
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing (CORS)
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Testing Listen Application
const PORT = process.env.PORT;
app.listen(PORT, () => (console.log(`Server running on port ${PORT}`)));

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB: ', err));




