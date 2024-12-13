const express = require('express');
const Room = require('../models/Room');
const redisClient = require('../utils/redisClient');
const { authMiddleware, adminMiddleware } = require('../middleware/AuthMiddleware');

const router = express.Router();

router.get('/availability', async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Please provide a date.' });
  }

  try {
    const targetDate = new Date(date).toISOString();

    // Redis Cache Check
    redisClient.get(targetDate, async (err, cachedRooms) => {
      if (err) {
        console.error('Redis error:', err);
        return res.status(500).json({ message: 'Redis error' });
      }

      if (cachedRooms) {
        console.log('Redis Cache used.');
        return res.status(200).json(JSON.parse(cachedRooms));
      }

      // Query from the database
      const availableRooms = await Room.find({
        availability: true,
        bookedDates: { $ne: new Date(date) },
      });

      // Save result to Redis Cache
      redisClient.setex(targetDate, 3600, JSON.stringify(availableRooms));

      res.status(200).json(availableRooms);
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/classification', async (req, res) => {
  const { type } = req.query;

  if (!type) {
    return res.status(400).json({ message: 'Please specify a room type.' });
  }

  try {
    const rooms = await Room.find({ type });
    res.status(200).json(rooms);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/edit', authMiddleware, adminMiddleware, async (req, res) => {
  const { roomId, updates } = req.body;

  if (!roomId || !updates) {
    return res.status(400).json({ message: 'Room ID and updates are required.' });
  }

  try {
    const room = await Room.findByIdAndUpdate(roomId, updates, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    res.status(200).json({ message: 'Room successfully updated.', room });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
