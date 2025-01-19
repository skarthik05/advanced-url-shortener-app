import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import useragent from 'express-useragent';
import passport from 'passport'
import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/authRoutes.js';
import urlRoutes from './routes/urlRoutes.js';
import analyticRoutes from './routes/analyticRoutes.js';
import checkUserId from './middlewares/userMiddleware.js';

import connectDB from './config/db.js';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(useragent.express());

app.use('/api/auth', authRoutes);
app.use('/api/url', checkUserId,urlRoutes);
app.use('/api/analytics', checkUserId,analyticRoutes);

connectDB()

app.get('/', (req, res) => {
    res.send('Hello World');
});
app.get('/success',checkUserId ,(req, res) => {
    res.send('Successfully logged in');
});

app.get('/failure',checkUserId ,(req, res) => {
    res.send('Failed to log in');
});


export default app;

