import express from 'express';
import { getUrlAnalytics, getTopicAnalytics, getUserAnalytics } from '../controllers/analyticsController.js';
import rateLimiter from '../middlewares/rateLimiter.js';
const router = express.Router();

router.get(`/overall`, rateLimiter, getUserAnalytics)
router.get('/:alias', getUrlAnalytics);
router.get(`/topic/:topic`, getTopicAnalytics);


export default router;
