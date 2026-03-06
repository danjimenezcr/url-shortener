// Import the model as UrlModel to avoid naming collision with the built-in URL constructor
const UrlModel = require('../models/URL');

// Validates that a string is a well-formed URL using the built-in URL constructor.
function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

// Creates a new shortened URL entry.
// Validates format first (fail fast), then lets the model generate the shortCode via nanoid default.
async function createUrl(originalUrl) {
  if (!isValidUrl(originalUrl)) {
    const err = new Error('Invalid URL format');
    err.status = 400;
    throw err;
  }

  const url = new UrlModel({ originalUrl });
  return await url.save();
}

// Returns all URL documents sorted newest first.
async function getAllUrls() {
  return await UrlModel.find().sort({ createdAt: -1 });
}

// Returns a single URL by its MongoDB _id.
// Throws a 404-style error if not found so the controller can respond appropriately.
async function getUrlById(id) {
  const url = await UrlModel.findById(id);
  if (!url) {
    const err = new Error('URL not found');
    err.status = 404;
    throw err;
  }
  return url;
}

// Returns a single URL by its shortCode.
// Used during redirects — this is the hottest query path in the system.
async function getUrlByShortCode(shortCode) {
  const url = await UrlModel.findOne({ shortCode });
  if (!url) {
    const err = new Error('Short code not found');
    err.status = 404;
    throw err;
  }
  return url;
}

// Atomically increments clickCount by 1 using $inc.
// Atomic update prevents race conditions under concurrent redirect traffic.
async function incrementClickCount(id) {
  return await UrlModel.findByIdAndUpdate(
    id,
    { $inc: { clickCount: 1 } },
    { new: true }
  );
}

module.exports = {
  createUrl,
  getAllUrls,
  getUrlById,
  getUrlByShortCode,
  incrementClickCount,
};
