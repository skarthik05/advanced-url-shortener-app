import Analytics from '../models/Analytics.js';
import geoip from 'geoip-lite';

export const logAnalytics = async (req, res) => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const geo = geoip.lookup(ipAddress);

    const analyticsData = {
      urlId: req.urlDoc._id,
      userAgent: req.headers['user-agent'],
      ipAddress,
      osType: req.useragent.os,
      deviceType: req.useragent.isMobile ? 'Mobile' : req.useragent.isTablet ? 'Tablet' : 'Desktop',
      geolocation: geo ? { country: geo.country, city: geo.city } : {},
    };
    await Analytics.create(analyticsData);
  } catch (error) {
    console.error('Error logging analytics:', error.message);
  }
};



export default { logAnalytics };