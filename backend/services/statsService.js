const geoip = require('geoip-lite');
const Visit = require('../models/Visit');
const UrlModel = require('../models/URL');

// Formats a Date object to "YYYY-MM-DD" for grouping visits by day.
function toDateString(date) {
  return new Date(date).toISOString().slice(0, 10);
}

// Formats a "YYYY-MM-DD" string to a short human-readable label (e.g. "Mar 5").
// Used as axis labels in the Chart.js dataset.
function toChartLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Shared guard — verifies the URL exists before running any stats query.
// Throws a 404-style error if not found so controllers can respond appropriately.
async function assertUrlExists(urlId) {
  const url = await UrlModel.findById(urlId);
  if (!url) {
    const err = new Error('URL not found');
    err.status = 404;
    throw err;
  }
}

// Returns a full stats summary for a given URL:
//   - totalVisits: total number of visit documents
//   - visits: full visit list sorted newest first
//   - dailyBreakdown: visit counts keyed by date string { "2026-03-05": 4, ... }
async function getStatsByUrlId(urlId) {
  await assertUrlExists(urlId);

  const visits = await Visit.find({ urlId }).sort({ timestamp: -1 });

  const dailyBreakdown = visits.reduce((acc, visit) => {
    const day = toDateString(visit.timestamp);
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  return {
    totalVisits: visits.length,
    visits,
    dailyBreakdown,
  };
}

// Returns a ranked list of countries that accessed a given URL.
// Uses geoip-lite for offline IP-to-country resolution (no external API call).
// IPs that cannot be resolved (localhost, private ranges, missing) fall into "Unknown".
//
// Returns: { countries: [{ country: "US", count: 12 }, ...] } sorted by count descending.
async function getCountriesByUrlId(urlId) {
  await assertUrlExists(urlId);

  // Only fetch ipAddress to keep the query lightweight
  const visits = await Visit.find({ urlId }, 'ipAddress');

  const countryCount = visits.reduce((acc, visit) => {
    const geo = visit.ipAddress ? geoip.lookup(visit.ipAddress) : null;
    // geo.country is an ISO 3166-1 alpha-2 code (e.g. "US", "CR", "DE")
    const country = geo ? geo.country : 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  const countries = Object.entries(countryCount)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  return { countries };
}

// Returns a Chart.js-compatible data structure for daily visit frequency.
// Visits are grouped by day and sorted ascending so the chart reads left-to-right chronologically.
//
// Returns:
//   {
//     labels: ["Mar 1", "Mar 2", ...],           // x-axis labels
//     datasets: [{ label: "Visits", data: [4, 7, ...] }]  // y-axis values
//   }
async function getDailyFrequencyChartData(urlId) {
  await assertUrlExists(urlId);

  // Only fetch timestamp — no need for the full visit document
  const visits = await Visit.find({ urlId }, 'timestamp').sort({ timestamp: 1 });

  const dateCount = visits.reduce((acc, visit) => {
    const day = toDateString(visit.timestamp);
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  // Object.keys order is not guaranteed — sort explicitly before mapping
  const sortedDates = Object.keys(dateCount).sort();

  return {
    labels: sortedDates.map(toChartLabel),
    datasets: [
      {
        label: 'Visits',
        data: sortedDates.map(d => dateCount[d]),
      },
    ],
  };
}

module.exports = {
  getStatsByUrlId,
  getCountriesByUrlId,
  getDailyFrequencyChartData,
};
