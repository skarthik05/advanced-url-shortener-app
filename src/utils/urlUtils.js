import { v4 as uuidv4 } from 'uuid';

const generateRandomString = () => uuidv4().slice(0, 8);

export const generateShortUrl = (customAlias) => {
    const randomPart = generateRandomString();
    return customAlias ? `${customAlias}-${randomPart}` : randomPart;
};
