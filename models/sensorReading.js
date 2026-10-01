const mongoose = require('mongoose');

module.exports = mongoose.model('SensorReading', new mongoose.Schema({
  deviceId: String,
  room: String,
  type: String,
  value: Number,
  timestamp: Date
}));