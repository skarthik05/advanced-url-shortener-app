import express from 'express';
import { getUrlAnalytics, getTopicAnalytics } from '../controllers/analyticsController.js';
const router = express.Router();

router.get('/:alias', getUrlAnalytics);
router.get(`/topic/:topic`, getTopicAnalytics);


export default router;
