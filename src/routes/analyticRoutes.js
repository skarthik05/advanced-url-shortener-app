import express from 'express';
import { getUrlAnalytics, getTopicAnalytics, getUserAnalytics } from '../controllers/analyticsController.js';
const router = express.Router();

router.get(`/overall`,getUserAnalytics)
router.get('/:alias', getUrlAnalytics);
router.get(`/topic/:topic`, getTopicAnalytics);


export default router;
