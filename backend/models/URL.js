const mongoose = require('mongoose');
const nanoid = require('nanoid');

/*
URL schema:
  - Represents a single shortened url entry in the database. 
  - Each document mpas one original URL to one unique short code. 
*/
const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true, // Remove miss-leading whitespaces from user input
    },

    shortCode: { // Attachs to base url for redirection
      type: String,
      required: [true, 'Short code is required'],
      unique: true,
      minlength: [5, 'Short code must be at least 5 characters'], // Enforce a minimum length for better uniqueness and aesthetics lol
      trim: true,
      default: () => nanoid.nanoid(5), // Generate a unique 5-char short code using nanoid
    },

    clickCount: { // Denormalize visit count
      type: Number,
      default: 0,
      min: [0, 'Click count cannot be negative'],
    },
  },
  {
    timestamps: true, // Automatic audit fields: createdAt and updatedAt
  }
);

// Index shortCode for fast lookups on every redirect 
urlSchema.index({ shortCode: 1 });

module.exports = mongoose.model('URL', urlSchema);
