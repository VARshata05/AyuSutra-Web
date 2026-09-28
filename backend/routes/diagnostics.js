// routes/diagnostics.js
const express   = require('express');
const router    = express.Router();
const { Diagnostic } = require('../models');
const { searchNearbyDiagnostics } = require('../services/mappls');

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng are required' });

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInKm = parseFloat(radius);

    // Try geo query first
    try {
      let diagnostics = await Diagnostic.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [longitude, latitude] },
            $maxDistance: radiusInKm * 1000
          }
        }
      }).lean();

      diagnostics = diagnostics.map(d => ({
        ...d,
        id: d._id,
        distance: calculateDistance(latitude, longitude, d.lat, d.lng)
      }));

      return res.json({ count: diagnostics.length, diagnostics });
    } catch (geoErr) {
      // Fallback: JS-based filtering
    }

    let diagnostics = await Diagnostic.find().lean();
    
    diagnostics = diagnostics.map(d => ({
      ...d,
      id: d._id,
      distance: calculateDistance(latitude, longitude, d.lat, d.lng)
    }))
    .filter(d => d.distance <= radiusInKm)
    .sort((a, b) => a.distance - b.distance);

    res.json({ count: diagnostics.length, diagnostics });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/search', async (req, res) => {
  try {
    const { q, test } = req.query;
    let filter = {};

    if (q) filter.name = { $regex: q, $options: 'i' };
    if (test) filter.testsAvailable = { $regex: test, $options: 'i' };

    let diagnostics = await Diagnostic.find(filter).lean();
    diagnostics = diagnostics.map(d => ({ ...d, id: d._id }));

    res.json({ count: diagnostics.length, diagnostics });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/nearby/live', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng are required' });
    const results = await searchNearbyDiagnostics(parseFloat(lat), parseFloat(lng), parseInt(radius));
    res.json({ count: results.length, diagnostics: results, source: 'mappls-live' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
