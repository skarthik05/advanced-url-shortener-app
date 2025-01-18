import { jest } from '@jest/globals';
import { logAnalytics, getUrlAnalytics, getTopicAnalytics, getUserAnalytics } from '../../controllers/analyticsController.js';
import Analytics from '../../models/Analytics.js';
import URL from '../../models/URL.js';
import redisClient from '../../config/redis.js';
import {  mockUserAnalytics, mockUrlAnalytics } from '../mocks/analyticsMocks.js';

jest.mock('../../config/redis.js', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        setex: jest.fn().mockResolvedValue('OK')
    }
}));

jest.mock('../../models/Analytics.js', () => ({
    __esModule: true,
    default: {
        create: jest.fn(),
        aggregate: jest.fn()
    }
}));

jest.mock('../../models/URL.js', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        find: jest.fn(),
        aggregate: jest.fn()
    }
}));

jest.mock('geoip-lite', () => ({
    lookup: jest.fn()
}));

describe('Analytics Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            urlDoc: { _id: 'url123' },
            headers: {
                'user-agent': 'test-agent',
                'x-forwarded-for': '1.1.1.1'
            },
            useragent: {
                os: 'Windows',
                isMobile: false,
                isTablet: false
            },
            connection: { remoteAddress: '1.1.1.1' },
            user: { _id: 'user123' },
            params: { alias: 'test123' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();

        jest.clearAllMocks();
    });

    describe('logAnalytics', () => {
        it('should log analytics data successfully', async () => {
            const mockAnalytics = {
                urlId: 'url123',
                userAgent: 'test-agent',
                ipAddress: '1.1.1.1',
                osType: 'Windows',
                deviceType: 'Desktop',
                geolocation: { country: 'US', city: 'New York' }
            };

            Analytics.create.mockResolvedValue(mockAnalytics);

            await logAnalytics(req, res);

            expect(Analytics.create).toHaveBeenCalledWith(expect.objectContaining({
                urlId: req.urlDoc._id,
                userAgent: req.headers['user-agent'],
                ipAddress: req.headers['x-forwarded-for'],
                osType: req.useragent.os,
                deviceType: 'Desktop'
            }));
        });
    });

    describe('getUrlAnalytics', () => {
        const mockAggregateResult = {
            totalClicks: [{ count: 7 }],
            uniqueUsers: [{ count: 2 }],
            clicksByDate: [],
            osType: [
                {
                    osName: "Windows 10.0",
                    uniqueClicks: 4,
                    uniqueUsers: 2
                }
            ],
            deviceType: []
        };

        it('should return cached analytics if available', async () => {
            redisClient.get.mockResolvedValue(JSON.stringify(mockUrlAnalytics));
            await getUrlAnalytics(req, res);
            expect(res.json).toHaveBeenCalledWith(mockUrlAnalytics);
        });

        it('should fetch and return analytics data if not cached', async () => {
            const mockUrl = { _id: 'url123' };
            redisClient.get.mockResolvedValue(null);
            URL.findOne.mockResolvedValue(mockUrl);
            Analytics.aggregate.mockResolvedValue([mockAggregateResult]);

            await getUrlAnalytics(req, res);

            const expectedResponse = {
                totalClicks: 7,
                uniqueUsers: 2,
                clicksByDate: [],
                osType: mockAggregateResult.osType,
                deviceType: []
            };

            expect(res.json).toHaveBeenCalledWith(expectedResponse);
        });

        it('should handle URL not found', async () => {
            redisClient.get.mockResolvedValue(null);
            URL.findOne.mockResolvedValue(null);

            await getUrlAnalytics(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'URL not found' });
        });
    });

    describe('getTopicAnalytics', () => {
        it('should return topic analytics data', async () => {
            const mockTopicResult = {
                totalClicks: [{ count: 1 }],
                uniqueUsers: [{ count: 1 }],
                clicksByDate: [
                    { date: "2025-01-18", clicks: 1 }
                ],
                urls: [
                    { shortUrl: "techforum", totalClicks: 1, uniqueUsers: 1 }
                ]
            };

            URL.aggregate.mockResolvedValue([mockTopicResult]);
            await getTopicAnalytics(req, res);

            const expectedResponse = {
                totalClicks: 1,
                uniqueUsers: 1,
                clicksByDate: mockTopicResult.clicksByDate,
                urls: mockTopicResult.urls
            };

            expect(res.json).toHaveBeenCalledWith(expectedResponse);
        });

        it('should handle empty results', async () => {
            const emptyResult = {
                totalClicks: [],
                uniqueUsers: [],
                clicksByDate: [],
                urls: []
            };
            URL.aggregate.mockResolvedValue([emptyResult]);

            await getTopicAnalytics(req, res);

            expect(res.json).toHaveBeenCalledWith({
                totalClicks: 0,
                uniqueUsers: 0,
                clicksByDate: [],
                urls: []
            });
        });

        it('should handle errors gracefully', async () => {
            URL.aggregate.mockRejectedValue(new Error('Database error'));
            await getTopicAnalytics(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });

    describe('getUserAnalytics', () => {
        it('should return user analytics data', async () => {
            const mockUrls = [{ _id: 'url123' }, { _id: 'url456' }];
         
            URL.find.mockResolvedValue(mockUrls);
            Analytics.aggregate.mockResolvedValue([mockUserAnalytics]);

            await getUserAnalytics(req, res);
            expect(URL.find).toHaveBeenCalledWith({ userId: req.user._id });
            const expectedResponse = {
                totalUrls: 1,
                totalClicks: 1,
                uniqueUsers: 1,
                clicksByDate: mockUserAnalytics.clicksByDate,
                osType: mockUserAnalytics.osType,
                deviceType: mockUserAnalytics.deviceType
            };
            expect(res.json).toHaveBeenCalledWith(expectedResponse);
        });

        it('should handle empty results', async () => {
            const emptyResult = {
                totalClicks: [],
                uniqueUsers: [{ 
                    count: 0 
                }],
                clicksByDate: [],
                osType: [],
                deviceType: []
            };

            // Mock empty results
            URL.find.mockResolvedValue([]);
            Analytics.aggregate.mockResolvedValue([emptyResult]);

            await getUserAnalytics(req, res);

            const expectedEmptyResponse = {
                totalUrls: 0,
                totalClicks: 0,
                uniqueUsers: 0,
                clicksByDate: [],
                osType: [],
                deviceType: []
            };

            expect(res.json).toHaveBeenCalledWith(expectedEmptyResponse);
        });

        it('should handle error gracefully', async () => {
            URL.find.mockImplementation(() => {
                throw new Error('Database error');
            });

            await getUserAnalytics(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });
});

