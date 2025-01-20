import URL from '../models/URL.js';
import { generateShortUrl } from '../utils/urlUtils.js';
import redisClient from '../config/redis.js';

export const createShortUrl = async (req, res) => {
    try {
        const { longUrl, customAlias, topic } = req.body;
        if (!longUrl) return res.status(400).json({ error: 'Long URL is required' });
        const cachedLongUrl = await redisClient.get(longUrl);
        if (cachedLongUrl) return res.status(400).json({ error: 'Long URL already exists', shortUrl: cachedLongUrl });
        const shortUrl = generateShortUrl(customAlias);

        const newUrl = await URL.create({
            longUrl,
            shortUrl,
            topic,
            userId: req.user._id,
        });
        await redisClient.setex(shortUrl, 3600, longUrl);
        await redisClient.setex(longUrl, 3600, shortUrl);
        res.status(201).json({ shortUrl, createdAt: newUrl.createdAt });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const redirectShortUrl = async (req, res, next) => {
    try {
        const { alias } = req.params;

        const cachedLongUrl = await redisClient.get(alias);
        if (cachedLongUrl) {
            return res.redirect(cachedLongUrl);
        }

        const urlDoc = await URL.findOne({ shortUrl: alias });
        if (!urlDoc) return res.status(404).json({ error: 'Short URL not found' });

        req.urlDoc = urlDoc;
        res.redirect(urlDoc.longUrl);
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


