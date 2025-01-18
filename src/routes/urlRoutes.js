import express from 'express';
import { createShortUrl } from '../controllers/urlController.js';
import { redirectShortUrl } from '../controllers/urlController.js';
import { logAnalytics } from '../controllers/analyticsController.js';
import rateLimiter from '../middlewares/rateLimiter.js';
const router = express.Router();

router.post('/shorten',rateLimiter ,createShortUrl);
router.get('/:alias', redirectShortUrl, logAnalytics);

export default router;
