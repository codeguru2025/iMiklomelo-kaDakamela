import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { authStorage } from "./storage";

const SUPERUSER_EMAIL = process.env.SUPERUSER_EMAIL || "";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const isProduction = process.env.NODE_ENV === "production";
  console.log(`[Session Store] Environment: ${process.env.NODE_ENV}`);
  console.log(`[Session Store] Using SSL: ${isProduction}`);
  
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    conObject: isProduction
      ? { ssl: { rejectUnauthorized: false } }
      : undefined,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "imiklomelo-session-secret-change-me",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (clientID && clientSecret) {
    const callbackURL = `${process.env.APP_URL || "http://localhost:5000"}/api/auth/google/callback`;

    passport.use(
      new GoogleStrategy(
        { clientID, clientSecret, callbackURL },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || "";
            const isSuperuser = email.toLowerCase() === SUPERUSER_EMAIL;

            // Check if user already exists to preserve their role
            const existingUser = await authStorage.getUserByEmail(email);

            const role = isSuperuser
              ? "superuser"
              : existingUser?.role === "admin" || existingUser?.role === "superuser"
                ? existingUser.role
                : "public";

            const user = await authStorage.upsertUser({
              id: profile.id,
              email,
              firstName: profile.name?.givenName || null,
              lastName: profile.name?.familyName || null,
              profileImageUrl: profile.photos?.[0]?.value || null,
              role,
            });

            done(null, user);
          } catch (error) {
            done(error as Error);
          }
        }
      )
    );

    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await authStorage.getUser(id);
        done(null, user || null);
      } catch (error) {
        done(error);
      }
    });

    app.get("/api/login", passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
    }));

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/" }),
      (req: any, res) => {
        console.log("[auth] Google callback successful, user:", req.user?.email, "role:", req.user?.role);
        res.redirect("/admin");
      }
    );

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        req.session.destroy(() => {
          res.redirect("/");
        });
      });
    });

    console.log("[auth] Google OAuth enabled");
  } else {
    // Dev fallback: no Google OAuth configured
    app.get("/api/login", (_req, res) => {
      res.redirect("/admin");
    });
    app.get("/api/logout", (_req, res) => {
      res.redirect("/");
    });
    console.log("[auth] No Google OAuth credentials — admin uses ADMIN_SECRET_KEY header in dev");
  }
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export function isAdmin(req: any): boolean {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const role = req.user?.role;
    if (role === "admin" || role === "superuser") return true;
  }
  // Fallback for dev / API key access
  const adminKey = req.headers["x-admin-key"];
  if (adminKey && adminKey === process.env.ADMIN_SECRET_KEY) return true;
  if (process.env.NODE_ENV !== "production") return true;
  return false;
}

export function isSuperuser(req: any): boolean {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return req.user?.role === "superuser";
  }
  return false;
}
