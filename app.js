const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

const roomRoutes = require('./src/routes/rooms');
const userRoutes = require('./src/routes/users');
const bookingRoutes = require('./src/routes/bookings');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/rooms', roomRoutes);
app.use('/users', userRoutes);
app.use('/bookings', bookingRoutes);

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connection successful'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}.`));
