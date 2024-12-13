const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { authMiddleware, adminMiddleware } = require('../middleware/AuthMiddleware');

const router = express.Router();

router.post('/create', authMiddleware, async (req, res) => {
  const { roomId, date } = req.body;

  if (!roomId || !date) {
    return res.status(400).json({ message: 'Room ID and date are required.' });
  }
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    // Check if the date is available
    if (room.bookedDates.includes(targetDate.toISOString())) {
      return res.status(400).json({ message: 'The room is already booked on this date.' });
    }

    // Save the booking
    const newBooking = new Booking({
      customerId: req.user.id,
      roomId: room._id,
      date: targetDate,
    });

    await newBooking.save();

    // Update the room 
    room.bookedDates.push(targetDate);
    await room.save();

    res.status(201).json({
      message: 'Booking successfully created.',
      booking: newBooking,
      room,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('customerId roomId');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/user', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id }).populate('roomId');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Monthly analysis report (Admin)
router.get('/monthly-report', authMiddleware, adminMiddleware, async (req, res) => {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ message: 'Year and month are required.' });
  }

  try {
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(`${year}-${month}-01`);
    endDate.setMonth(endDate.getMonth() + 1);

    const bookings = await Booking.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: '$roomId',
          totalBookings: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'rooms',
          localField: '_id',
          foreignField: '_id',
          as: 'roomDetails',
        },
      },
    ]);

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/cancel/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Remove the booking date from the room
    const room = await Room.findById(booking.roomId);
    if (room) {
      room.bookedDates = room.bookedDates.filter(
        (date) => date.toISOString() !== booking.date.toISOString()
      );
      await room.save();
    }

    res.status(200).json({ message: 'Booking successfully canceled.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
