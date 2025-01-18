jest.mock('express-rate-limit', () => {
    const requests = new Map();

    return jest.fn().mockImplementation((options) => {
        return (req, res, next) => {
            const ip = req.ip;
            const count = (requests.get(ip) || 0) + 1;
            requests.set(ip, count);

            if (count > options.max) {
                return res.status(429).json({ error: options.message });
            }
            next();
        };
    });
});

import { limiter } from '../../middlewares/rateLimiter.js';

describe('Rate Limiter Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            ip: '127.0.0.1',
            get: jest.fn()
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    it('should call next() if rate limit not exceeded', () => {
        limiter(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should respond with 429 if rate limit exceeded', async () => {
        for (let i = 0; i < 5; i++) {
            await limiter(req, res, next);
        }

        next.mockReset();

        await limiter(req, res, next);

        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Too many requests, please try again later.'
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should identify different IPs separately', async () => {
        const req2 = {
            ip: '127.0.0.2',
            get: jest.fn()
        };

        for (let i = 0; i < 5; i++) {
            await limiter(req, res, next);
        }

        await limiter(req2, res, next);
        expect(next).toHaveBeenCalled();
    });
});
