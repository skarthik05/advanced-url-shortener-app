import express from 'express';
import supertest from 'supertest';
import { jest } from '@jest/globals';

import {
  createShortUrl,
  redirectShortUrl,
} from '../../controllers/urlController.js';

import {
  getUserAnalytics,
  getUrlAnalytics,
  getTopicAnalytics,
} from '../../controllers/analyticsController.js';

import { rateLimiter } from '../../middlewares/rateLimiter.js';
import { logAnalytics } from '../../controllers/analyticsController.js';
import { mockUserAnalytics, mockUrlAnalytics, mockTopicAnalytics } from '../mocks/analyticsMocks.js';

jest.mock('../../middlewares/rateLimiter.js', () => {
  let counter = 0;
  const rateLimiter = jest.fn((req, res, next) => {
    counter++;
    if (counter === 1) {
      return next();
    }
    return res.status(429).json({ error: 'Too Many Requests' });
  });
  
  rateLimiter.resetCounter = () => {
    counter = 0;
  };
  
  return { rateLimiter };
});

jest.mock('../../controllers/urlController.js', () => ({
  createShortUrl: jest.fn((req, res) => res.status(201).json({ createdAt: new Date(), shortUrl: 'test' })),
  redirectShortUrl: jest.fn((req, res) => res.status(302).redirect('https://www.google.com')),
}));


jest.mock('../../controllers/analyticsController.js', () => ({
  logAnalytics: jest.fn((req, res) => res.status(200).json({ message: 'Analytics data' })),
  getUserAnalytics: jest.fn((req, res) => res.status(200).json(mockUserAnalytics)),
  getUrlAnalytics: jest.fn((req, res) => res.status(200).json(mockUrlAnalytics)),
  getTopicAnalytics: jest.fn((req, res) => res.status(200).json(mockTopicAnalytics)),
}));

const app = express();
app.use(express.json());
app.post('/api/url/shorten', rateLimiter, createShortUrl);
app.get('/api/url/:alias', redirectShortUrl, logAnalytics);
app.get('/api/analytics/topic/:topic', getTopicAnalytics);
app.get('/api/analytics/overall', rateLimiter, getUserAnalytics);
app.get('/api/analytics/:alias', getUrlAnalytics);

const request = supertest(app);

describe('Routes', () => {
  beforeEach(() => {
    rateLimiter.mockClear();
    rateLimiter.resetCounter();
  });

  it('POST /api/url/shorten - should create a short URL', async () => {
    const response = await request.post('/api/url/shorten').send({
      longUrl: 'https://www.google.com',
      topic: 'tech',
    });

    expect(response.status).toBe(201);
    expect(response.body.shortUrl).toBe('test');
  });

  it('POST /api/url/shorten - should return 429 for rate limit exceeded', async () => {
    // First request should succeed
    await request.post('/api/url/shorten').send({
      longUrl: 'https://www.google.com',
      topic: 'tech',
    });

    // Second request should be rate limited
    const response = await request.post('/api/url/shorten').send({
      longUrl: 'https://www.example.com',
      topic: 'tech',
    });

    expect(response.status).toBe(429);
    expect(response.body.error).toBe('Too Many Requests');
  });

  it('GET /api/url/:alias - should redirect to the long URL', async () => {
    const response = await request.get('/api/url/test');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('https://www.google.com');
  });

  it('GET /api/analytics/overall - should return user analytics', async () => {
    const response = await request.get('/api/analytics/overall');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUserAnalytics);
  });

  it('GET /api/analytics/overall - should return 429 for rate limit exceeded', async () => {
    await request.get('/api/analytics/overall');
    const response = await request.get('/api/analytics/overall');
    expect(response.status).toBe(429);
  });

  it('GET /api/analytics/:alias - should return URL analytics', async () => {
    const response = await request.get('/api/analytics/abc123');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUrlAnalytics);
  });

  it('GET /api/analytics/topic/:topic - should return topic analytics', async () => {
    const response = await request.get('/api/analytics/topic/tech');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTopicAnalytics);
  });

  it('POST /api/url/shorten - should handle errors properly', async () => {
    // Mock createShortUrl to throw an error for this test
    createShortUrl.mockImplementationOnce((req, res) => {
      return res.status(500).json({ error: 'Internal server error' });
    });

    const response = await request.post('/api/url/shorten').send({
      longUrl: 'https://www.google.com',
      topic: 'tech',
    });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
  });
});
