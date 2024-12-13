const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Basic', 'Premium', 'Suite'] },
  price: { type: Number, required: true },
  availability: { type: Boolean, default: true },
  bookedDates: [Date], // Keeps the dates reserved
});

module.exports = mongoose.model('Room', roomSchema);
