import session from 'express-session';
import MongoStore from 'connect-mongo';

export default function createSession() {
  return session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Change this to a secure secret in production
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 14 * 24 * 60 * 60, // 14 days
      autoRemove: 'native', // Remove expired sessions automatically
      crypto: {
        secret: process.env.SESSION_ENCRYPTION_KEY || 'your-encryption-key' // Change this in production
      }
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
      httpOnly: true, // Prevent client-side JS from reading the cookie
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      sameSite: 'lax', // CSRF protection
      path: '/',
      domain: process.env.COOKIE_DOMAIN || 'localhost'
    },
    name: 'sessionId' // Name of the session ID cookie
  });
}
