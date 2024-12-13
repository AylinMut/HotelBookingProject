const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  date: { type: Date, required: true }, // Booking date
  createdAt: { type: Date, default: Date.now }, // Booking creation date
});

module.exports = mongoose.model('Booking', bookingSchema);
