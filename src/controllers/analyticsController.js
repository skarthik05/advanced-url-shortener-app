import geoip from 'geoip-lite';
import Analytics from '../models/Analytics.js';
import URL from '../models/URL.js';
import { getDateOffsetByDays } from '../utils/dateUtils.js';

export const logAnalytics = async (req, res) => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const geo = geoip.lookup(ipAddress);

    const analyticsData = {
      urlId: req.urlDoc._id,
      userAgent: req.headers['user-agent'],
      ipAddress,
      osType: req.useragent.os ?? 'Unknown',
      deviceType: req.useragent.isMobile ? 'Mobile' : req.useragent.isTablet ? 'Tablet' : 'Desktop',
      geolocation: geo ? { country: geo.country, city: geo.city } : {},
    };
    await Analytics.create(analyticsData);
  } catch (error) {
    console.error('Error logging analytics:', error.message);
  }
};

export const getUrlAnalytics = async (req, res) => {
  try {
    const { alias } = req.params;

    const url = await URL.findOne({ customAlias: alias });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    const sevenDaysAgo = getDateOffsetByDays(-7);
    const pipeline = [
      { $match: { urlId: url._id } },

      {
        $project: {
          ipAddress: 1,
          osType: 1,
          deviceType: 1,
          timestamp: 1
        },
      },

      {
        $facet: {
          totalClicks: [{ $count: 'count' }],

          uniqueUsers: [
            { $group: { _id: '$ipAddress' } },
            { $count: 'count' },
          ],

          clicksByDate: [
            {
              $match: {
                timestamp: { $gte: sevenDaysAgo }
              }
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                },
                clicks: { $count: {} }
              }
            },
            {
              $sort: { _id: 1 }
            },
            {
              $project: {
                date: "$_id",
                clicks: 1,
                _id: 0
              }
            }
          ],


          osType: [
            {
              $group: {
                _id: '$osType',
                uniqueClicks: { $count: {} },
                uniqueUsers: { $addToSet: '$ipAddress' },
              },
            },
            {
              $project: {
                osName: '$_id',
                uniqueClicks: 1,
                uniqueUsers: { $size: '$uniqueUsers' },
                _id: 0,
              },
            },
          ],

          deviceType: [
            {
              $group: {
                _id: '$deviceType',
                uniqueClicks: { $count: {} },
                uniqueUsers: { $addToSet: '$ipAddress' },
              },
            },
            {
              $project: {
                deviceName: '$_id',
                uniqueClicks: 1,
                uniqueUsers: { $size: '$uniqueUsers' },
                _id: 0,
              },
            },
          ],
        },
      },
    ];

    const [result] = await Analytics.aggregate(pipeline);

    const response = {
      totalClicks: result?.totalClicks[0]?.count ?? 0,
      uniqueUsers: result?.uniqueUsers[0]?.count ?? 0,
      clicksByDate: result.clicksByDate,
      osType: result.osType,
      deviceType: result.deviceType,
    };


    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTopicAnalytics = async (req, res) => {
  try {
    const { topic } = req.params;
    const pipeline = [
      {
        $match: { topic },
      },
      {
        $lookup: {
          from: 'analytics',
          localField: '_id',
          foreignField: 'urlId',
          as: 'analytics',
        },
      },
      {
        $unwind: '$analytics',
      },
      {
        $facet: {
          totalClicks: [{ $count: 'count' }],

          uniqueUsers: [
            { $group: { _id: '$analytics.ipAddress' } },
            { $count: 'count' },
          ],

          clicksByDate: [
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$analytics.timestamp',
                  },
                },
                clicks: { $count: {} },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                date: '$_id',
                clicks: 1,
                _id: 0,
              },
            },
          ],

          urls: [
            {
              $group: {
                _id: '$analytics.urlId',
                shortUrl: { $first: '$shortUrl' },
                totalClicks: { $count: {} },
                uniqueUsers: { $addToSet: '$analytics.ipAddress' },
              },
            },
            {
              $project: {
                shortUrl: 1,
                totalClicks: 1,
                uniqueUsers: { $size: '$uniqueUsers' },
                _id: 0,
              },
            },
          ],
        },
      },
    ];

    const [result] = await URL.aggregate(pipeline);

    const response = {
      totalClicks: result?.totalClicks[0]?.count ?? 0,
      uniqueUsers: result?.uniqueUsers[0]?.count ?? 0,
      clicksByDate: result.clicksByDate ?? [],
      urls: result.urls ?? [],
    };
    res.json(response);


  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};


