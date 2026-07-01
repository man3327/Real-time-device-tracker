const mongoose = require('mongoose');
const locationPingSchema = new mongoose.Schema({
  device: {
    type:mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
  },
  lat: {type: Number, required: true },
  lng: {type: Number, required: true },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
locationPingSchema.index({device:1,timestamp: 1});
module.exports = mongoose.model('LocationPing', locationPingSchema);