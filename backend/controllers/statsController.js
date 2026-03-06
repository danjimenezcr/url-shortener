const statsService = require('../services/statsService');

// GET /api/urls/:id/stats
async function getUrlStats(req, res) {
  try {
    const { id } = req.params;

    const stats = await statsService.getStatsByUrlId(id);
    const countries = await statsService.getCountriesByUrlId(id);
    const chart = await statsService.getDailyFrequencyChartData(id);

    // Unificamos en una sola respuesta para el frontend
    return res.status(200).json({
      urlId: id,
      totalVisits: stats.totalVisits,
      visits: stats.visits,
      dailyBreakdown: stats.dailyBreakdown,
      countries: countries.countries,
      chart
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { getUrlStats };