const express = require('express');
const router = express.Router();

const urlService = require('../services/urlService');
const visitService = require('../services/visitService');

router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // 1) Buscar URL por shortCode
    const url = await urlService.getUrlByShortCode(shortCode);

    // 2) Obtener IP y User-Agent
    const ip =
      (req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim()) ||
      req.socket.remoteAddress ||
      req.ip;

    const userAgent = req.headers['user-agent'] || '';

    // 3) Guardar visita
    await visitService.logVisit(url._id, ip, userAgent);

    // 4) Incrementar contador
    await urlService.incrementClickCount(url._id);

    // 5) Redirigir
    return res.redirect(url.originalUrl);
  } catch (err) {
    return res.status(err.status || 404).send(err.message || 'Not found');
  }
});

module.exports = router;