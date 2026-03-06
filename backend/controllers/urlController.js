const urlService = require('../services/urlService');

// POST /api/urls
// Body: { originalUrl: "https://..." }
// Creates a new shortened URL and returns the full document plus the assembled shortUrl.
async function createUrl(req, res) {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: 'originalUrl is required' });
    }

    const url = await urlService.createUrl(originalUrl);
    const baseUrl = process.env.BASE_URL;

    return res.status(201).json({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      clickCount: url.clickCount,
      createdAt: url.createdAt,
      shortUrl: `${baseUrl}/${url.shortCode}`,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

// GET /api/urls
// Returns all URLs sorted newest first, each with its assembled shortUrl.
async function getAllUrls(req, res) {
  try {
    const baseUrl = process.env.BASE_URL;
    const urls = await urlService.getAllUrls();

    const result = urls.map(url => ({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      clickCount: url.clickCount,
      createdAt: url.createdAt,
      shortUrl: `${baseUrl}/${url.shortCode}`,
    }));

    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

// GET /api/urls/:id
// Returns a single URL by its MongoDB _id plus its assembled shortUrl.
async function getUrlById(req, res) {
  try {
    const baseUrl = process.env.BASE_URL;
    const url = await urlService.getUrlById(req.params.id);

    return res.status(200).json({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      clickCount: url.clickCount,
      createdAt: url.createdAt,
      shortUrl: `${baseUrl}/${url.shortCode}`,
    });
  } catch (err) {
    return res.status(err.status || 404).json({ error: err.message });
  }
}

module.exports = { createUrl, getAllUrls, getUrlById };
