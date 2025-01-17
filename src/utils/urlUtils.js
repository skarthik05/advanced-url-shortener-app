import { v4 as uuidv4 } from 'uuid';

export const generateShortUrl = (customAlias) => {
    const baseUrl = `alteroffice.com`

    const shortPath = customAlias || uuidv4().slice(0, 8);
    return `${baseUrl}/${shortPath}`;
};

export default { generateShortUrl };
