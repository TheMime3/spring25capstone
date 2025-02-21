import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import User from '../models/User.js';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 
      provider: 'google',
      providerId: profile.id
    });

    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        provider: 'google',
        providerId: profile.id
      });
    }

    done(null, user);
  } catch (error) {
    done(error);
  }
}));

passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: '/auth/microsoft/callback',
  scope: ['user.read']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({
      provider: 'microsoft',
      providerId: profile.id
    });

    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        provider: 'microsoft',
        providerId: profile.id
      });
    }

    done(null, user);
  } catch (error) {
    done(error);
  }
}));

export default passport;