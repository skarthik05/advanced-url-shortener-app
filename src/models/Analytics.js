import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  urlId: { type: mongoose.Schema.Types.ObjectId, ref: 'URL', required: true },
  timestamp: { type: Date, default: Date.now },
  userAgent: String,
  ipAddress: String,
  osType: String,
  deviceType: String,
  geolocation: {
    country: String,
    city: String,
  },
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;
