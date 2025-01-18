import URL from '../models/URL.js';
import { generateShortUrl } from '../utils/urlUtils.js';
import redisClient from '../config/redis.js';

export const createShortUrl = async (req, res) => {
    try {
        const { longUrl, customAlias, topic } = req.body;

        const shortUrl = generateShortUrl(customAlias);

        const newUrl = await URL.create({
            longUrl,
            shortUrl,
            topic,
            userId: req.user._id,
        });
        await redisClient.setex(customAlias, 3600, urlDoc.longUrl);
        res.status(201).json({ shortUrl, createdAt: newUrl.createdAt });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const redirectShortUrl = async (req, res, next) => {
    try {
        const { alias: customAlias } = req.params;

        const cachedLongUrl = await redisClient.get(customAlias);
        if (cachedLongUrl) {
            return res.redirect(cachedLongUrl);
        }

        const urlDoc = await URL.findOne({ customAlias });
        if (!urlDoc) return res.status(404).json({ error: 'Short URL not found' });

        req.urlDoc = urlDoc;
        res.redirect(urlDoc.longUrl);
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


