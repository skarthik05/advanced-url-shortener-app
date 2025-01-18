import { jest } from '@jest/globals';
import { createShortUrl, redirectShortUrl } from '../../controllers/urlController.js';
import URL from '../../models/URL.js';
import { generateShortUrl } from '../../utils/urlUtils.js';

jest.mock('../../config/redis.js', () => ({
  __esModule: true,
  default: {
    setex: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null)
  }
}));

jest.mock('../../models/URL.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findOne: jest.fn()
  }
}));

jest.mock('../../utils/urlUtils.js', () => ({
  __esModule: true,
  generateShortUrl: jest.fn().mockReturnValue('test123')
}));

describe('URL Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: { longUrl: 'https://www.google.com', topic: 'tech', customAlias: 'test123' },
      user: { _id: 'user123' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn()
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  it('should create a short URL', async () => {
    const mockResponse = {
      shortUrl: 'test123',
      createdAt: new Date()
    };
    
    URL.create.mockResolvedValue(mockResponse);

    await createShortUrl(req, res);

    expect(URL.create).toHaveBeenCalledWith({
      longUrl: req.body.longUrl,
      shortUrl: 'test123',
      topic: req.body.topic,
      userId: req.user._id
    });
    // expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      shortUrl: mockResponse.shortUrl,
      createdAt: mockResponse.createdAt
    });
  });

  it('should redirect to the long URL', async () => {
    const mockUrlDoc = {
      longUrl: 'https://www.google.com'
    };

    URL.findOne.mockResolvedValue(mockUrlDoc);
    req = { params: { alias: 'abc123' } };

    await redirectShortUrl(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith('https://www.google.com');
    expect(next).toHaveBeenCalled();
  });

  it('should handle URL not found', async () => {
    URL.findOne.mockResolvedValue(null);
    req = { params: { alias: 'nonexistent' } };

    await redirectShortUrl(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Short URL not found' });
  });

  it('should handle errors in URL creation', async () => {
    URL.create.mockRejectedValue(new Error('Database error'));

    await createShortUrl(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});
