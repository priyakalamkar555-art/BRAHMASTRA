const express = require('express');
const axios   = require('axios');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

/* POST /api/location/update */
router.post('/update', protect, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      'lastLocation.latitude':  latitude,
      'lastLocation.longitude': longitude,
      'lastLocation.updatedAt': new Date(),
      isLocationSharing: true
    });
    res.json({ success: true, message: 'Location updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* POST /api/location/stop */
router.post('/stop', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isLocationSharing: false });
    res.json({ success: true, message: 'Location sharing stopped' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/location/safe-places?latitude=&longitude=&radius= */
router.get('/safe-places', protect, async (req, res) => {
  try {
    const { latitude, longitude, radius = 2000 } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      // Demo data when no API key provided
      return res.json({
        success: true,
        places: [
          { name: 'City Hospital',   type: 'hospital',     distance: '0.8 km', lat: +latitude + 0.005, lng: +longitude + 0.003 },
          { name: 'Police Station',  type: 'police',       distance: '1.2 km', lat: +latitude - 0.007, lng: +longitude + 0.008 },
          { name: 'Fire Station',    type: 'fire_station', distance: '1.5 km', lat: +latitude + 0.009, lng: +longitude - 0.005 },
          { name: 'Pharmacy',        type: 'pharmacy',     distance: '0.4 km', lat: +latitude - 0.002, lng: +longitude + 0.001 }
        ]
      });
    }

    const types  = ['hospital', 'police', 'fire_station', 'pharmacy'];
    const places = [];

    for (const type of types) {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${apiKey}`;
      const { data } = await axios.get(url);
      if (data.results) {
        data.results.slice(0, 2).forEach((p) =>
          places.push({
            name:    p.name,
            type,
            address: p.vicinity,
            lat:     p.geometry.location.lat,
            lng:     p.geometry.location.lng,
            placeId: p.place_id,
            rating:  p.rating || null
          })
        );
      }
    }

    res.json({ success: true, places });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;