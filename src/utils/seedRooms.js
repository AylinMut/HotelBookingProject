const mongoose = require('mongoose');
const Room = require('../models/Room');
const dotenv = require('dotenv');

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connection successful'))
  .catch((err) => console.error('MongoDB connection error:', err));

const seedRooms = async () => {
  const roomTypes = ['Basic', 'Premium', 'Suite'];
  const rooms = [];

  for (let i = 1; i <= 10000; i++) {
    rooms.push({
      name: `Oda ${i}`,
      type: roomTypes[Math.floor(Math.random() * roomTypes.length)],
      price: Math.floor(Math.random() * 500) + 50,
      availability: true,
    });
  }
  try {
    await Room.insertMany(rooms);
    console.log('10,000 rooms added successfully.');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error adding room:', err);
    mongoose.connection.close();
  }
};

seedRooms();
