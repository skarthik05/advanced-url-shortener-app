import express from 'express';
import passport from '../controllers/authController.js';
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failure' }), (req, res) => {
  res.redirect('/success');
});

export default router;
