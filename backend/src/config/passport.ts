import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';
import prisma from './database';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const googleId = profile.id;
        const profileImage = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error('No email from Google'));
        }

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name,
              googleId,
              profileImage,
              role: 'INDIVIDUAL_HOME_BUILDER',
              city: 'Not Set',
              status: 'ACTIVE',
              isEmailVerified: true, // Google OAuth verifies the email
            },
          });
          console.log(`[Google OAuth] Created new user: ${email}`);
        } else if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId,
              profileImage,
              isEmailVerified: true, // Google OAuth verifies the email
            },
          });
          console.log(`[Google OAuth] Linked Google to existing user: ${email}`);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
