const mongoose = require('mongoose');

/*
Visit(s) schema:
  - Represents a single click/redirect event on shortened urls. 
  - Each document is created once per visit and never chaged after inserted. 
*/

const visitSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId, //Foreign key references the URL entry. 
    ref: 'URL',
    required: [true, 'URL reference is required'],
  },

  ipAddress: { // track VPN usage and geographic distribution of
    type: String, 
    trim: true,
  }, // not required bc some envs may not expose a reliable IP

  userAgent: { // broweser or device info from request headers
    type: String,
    trim: true,
  },

  timestamp: {
    type: Date,
    default: Date.now, // to track exact time of visit for analytics
  },
});

// Index urlId alone — for fast analytics, includes timestamp descending (-1) for efficient time-ordered queries.
visitSchema.index({ urlId: 1, timestamp: -1 });

module.exports = mongoose.model('Visit', visitSchema);
