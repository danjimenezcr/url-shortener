const visitService = require('../services/visitService');
const urlService = require('../services/urlService');
const statsService = require('../services/statsService');

// GET /:shortCode
// Main redirect endpoint and resolves the short code to the original URL
// logs the visit, increments the click count, then redirects the user
async function handleRedirect(req, res) {
  try {
    const { shortCode } = req.params;

    const url = await urlService.getUrlByShortCode(shortCode);

    // Extract IP
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      req.ip;

    const userAgent = req.headers['user-agent'] || '';

    // Log the visit and increment click count in parallel for performance
    await Promise.all([
      visitService.logVisit(url._id, ipAddress, userAgent),
      urlService.incrementClickCount(url._id),
    ]);

    return res.redirect(301, url.originalUrl);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

// GET /api/urls/:id/stats
// Returns full stats summary for a URL: totalVisits, visits list, dailyBreakdown
async function getStats(req, res) {
  try {
    const stats = await statsService.getStatsByUrlId(req.params.id);
    return res.status(200).json(stats);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

// GET /api/urls/:id/countries
// Returns a ranked list of countries that accessed the URL
async function getCountries(req, res) {
  try {
    const data = await statsService.getCountriesByUrlId(req.params.id);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

// GET /api/urls/:id/chart
// Returns Chart.js compatible daily frequency data for the stats view.
async function getChartData(req, res) {
  try {
    const data = await statsService.getDailyFrequencyChartData(req.params.id);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { handleRedirect, getStats, getCountries, getChartData };
```

Guarda con `Ctrl + O`, Enter, `Ctrl + X`.

---

## Resumen de endpoints que expone cada controlador
```
urlController
  POST   /api/urls          → createUrl
  GET    /api/urls          → getAllUrls
  GET    /api/urls/:id      → getUrlById

visitController
  GET    /:shortCode               → handleRedirect
  GET    /api/urls/:id/stats       → getStats
  GET    /api/urls/:id/countries   → getCountries
  GET    /api/urls/:id/chart       → getChartData
