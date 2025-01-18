import URL from '../models/URL.js';
import { generateShortUrl } from '../utils/urlUtils.js';

export const createShortUrl = async (req, res) => {
    try {
        const { longUrl, customAlias, topic } = req.body;

        const existing = customAlias ? await URL.findOne({ customAlias }) : null;
        if (existing) return res.status(400).json({ error: 'Custom alias already exists' });

        const shortUrl = generateShortUrl(customAlias);

        const newUrl = await URL.create({
            longUrl,
            shortUrl,
            topic,
            userId: req.user._id,
        });

        res.status(201).json({ shortUrl, createdAt: newUrl.createdAt });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const redirectShortUrl = async (req, res, next) => {
    try {
        const { alias: customAlias } = req.params;

        const urlDoc = await URL.findOne({ customAlias });
        if (!urlDoc) return res.status(404).json({ error: 'Short URL not found' });

        req.urlDoc = urlDoc;
        res.redirect(urlDoc.longUrl);
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


