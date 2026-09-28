// routes/hospitals.js
const express   = require('express');
const router    = express.Router();
const { Hospital } = require('../models');
const { searchNearbyHospitals } = require('../services/mappls');

// Helper for distance calculation in JS
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Nearby — uses MongoDB 2dsphere geo query when location index is available, JS fallback otherwise
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5, speciality } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng are required' });

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInKm = parseFloat(radius);

    let query = {};
    
    // Try geo query first
    try {
      query = {
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [longitude, latitude] },
            $maxDistance: radiusInKm * 1000 // meters
          }
        }
      };
      if (speciality) {
        query.specialities = { $regex: speciality, $options: 'i' };
      }
      let hospitals = await Hospital.find(query).limit(20).lean();
      // Add distance for response
      hospitals = hospitals.map(h => ({
        ...h,
        id: h._id,
        distance: calculateDistance(latitude, longitude, h.lat, h.lng)
      }));
      return res.json({ count: hospitals.length, hospitals });
    } catch (geoErr) {
      // Fallback: JS-based filtering if geo index not ready
    }

    let hospitals = await Hospital.find().lean();
    
    hospitals = hospitals.map(h => ({
      ...h,
      id: h._id,
      distance: calculateDistance(latitude, longitude, h.lat, h.lng)
    }))
    .filter(h => h.distance <= radiusInKm)
    .sort((a, b) => a.distance - b.distance);

    if (speciality) {
      hospitals = hospitals.filter(h => 
        h.specialities && JSON.stringify(h.specialities).toLowerCase().includes(speciality.toLowerCase())
      );
    }

    res.json({ count: hospitals.length, hospitals: hospitals.slice(0, 20) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Search
router.get('/search', async (req, res) => {
  try {
    const { q, district, speciality, scheme } = req.query;
    
    let filter = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (district) filter.district = { $regex: district, $options: 'i' };
    if (speciality) filter.specialities = { $regex: speciality, $options: 'i' };
    if (scheme) filter.schemesSupported = { $regex: scheme, $options: 'i' };

    let hospitals = await Hospital.find(filter).limit(30).lean();
    hospitals = hospitals.map(h => ({ ...h, id: h._id }));
    
    res.json({ count: hospitals.length, hospitals });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const h = await Hospital.findById(req.params.id).lean();
    if (!h) return res.status(404).json({ message: 'Hospital not found' });
    res.json({ ...h, id: h._id });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Real-time Mappls search
router.get('/nearby/live', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng are required' });
    
    const results = await searchNearbyHospitals(parseFloat(lat), parseFloat(lng), parseInt(radius));
    res.json({ count: results.length, hospitals: results, source: 'mappls-live' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const h = await Hospital.create(req.body);
    res.status(201).json({ ...h.toObject(), id: h._id });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
