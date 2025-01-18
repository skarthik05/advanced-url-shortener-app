import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs:  60 * 1000, 
  max: 5, 
  message: 'Too many requests, please try again later.',
});

export default limiter;