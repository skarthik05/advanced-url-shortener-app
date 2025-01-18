import express from 'express';
import { getUrlAnalytics, getTopicAnalytics, getUserAnalytics } from '../controllers/analyticsController.js';
import rateLimiter from '../middlewares/rateLimiter.js';
const router = express.Router();

router.get('/topic/:topic', getTopicAnalytics);
router.get('/overall', rateLimiter, getUserAnalytics);
router.get('/:alias', getUrlAnalytics);

export default router;
