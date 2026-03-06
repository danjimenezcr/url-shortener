const Visit = require('../models/Visit');

// Creates a single visit record for a given URL.
// ipAddress and userAgent are optional — pass req.ip / req.headers.
async function logVisit(urlId, ipAddress, userAgent) {
  const visit = new Visit({ urlId, ipAddress, userAgent });
  return await visit.save();
}

module.exports = { logVisit };
